import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

interface ExcelClient {
  // Colunas obrigatórias
  nome?: string
  email?: string
  telefone?: string
  
  // Colunas opcionais
  dataNascimento?: string
  endereco?: string
  observacoes?: string
  totalVisitas?: number
  valorTotal?: number
  ultimaVisita?: string
  servicosRealizados?: string
  ticketMedio?: number
  
  // Mapeamento alternativo para colunas específicas
  [key: string]: any // Permite qualquer coluna
}

interface ProcessedClient {
  name: string
  email: string
  phone: string
  birthDate?: Date
  address?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Use .xlsx ou .xls' },
        { status: 400 }
      )
    }

    // Ler arquivo Excel
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    // Pegar primeira planilha
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelClient[]

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Planilha vazia ou formato inválido' },
        { status: 400 }
      )
    }

    const results = {
      total: jsonData.length,
      created: 0,
      updated: 0,
      errors: [] as string[],
      details: [] as any[]
    }

    // Processar cada linha
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i]
      const rowNumber = i + 2 // +2 porque a primeira linha é cabeçalho e arrays começam em 0

      try {
        // Debug: mostrar todas as colunas disponíveis
        console.log(`Linha ${rowNumber} - Colunas disponíveis:`, Object.keys(row))
        console.log(`Linha ${rowNumber} - Dados completos:`, row)
        
        // Mapeamento automático baseado no conteúdo das colunas
        let nome = ''
        let email = ''
        let telefone = ''
        let dataCadastro = ''
        
        // Procurar por nome (primeira coluna ou coluna com "nome", "cliente", etc.)
        for (const [key, value] of Object.entries(row)) {
          const keyLower = key.toLowerCase()
          const valueStr = String(value || '').trim()
          
          if (!nome && (keyLower.includes('nome') || keyLower.includes('cliente') || key === '1' || key === 'A')) {
            nome = valueStr
          }
          
          if (!email && (keyLower.includes('email') || key === 'F' || valueStr.includes('@'))) {
            email = valueStr
          }
          
          if (!telefone && (keyLower.includes('telefone') || keyLower.includes('celular') || key === 'E' || keyLower.includes('phone'))) {
            telefone = valueStr
          }
          
          if (!dataCadastro && (keyLower.includes('data') || keyLower.includes('cadastro') || key === 'R')) {
            dataCadastro = valueStr
          }
        }
        
        // Debug: mostrar valores encontrados
        console.log(`Linha ${rowNumber} - Valores encontrados:`, { nome, email, telefone, dataCadastro })
        
        // Validar campos obrigatórios
        if (!nome || !email || !telefone) {
          results.errors.push(`Linha ${rowNumber}: Nome, email e telefone são obrigatórios. Encontrado: nome="${nome}", email="${email}", telefone="${telefone}". Colunas disponíveis: ${Object.keys(row).join(', ')}`)
          continue
        }

        // Processar dados do cliente
        const processedClient: ProcessedClient = {
          name: nome.trim(),
          email: email.trim().toLowerCase(),
          phone: telefone.trim(),
          birthDate: dataCadastro ? new Date(dataCadastro) : undefined,
          address: row.endereco?.trim() || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
          notes: row.observacoes?.trim() || ''
        }

        // Preparar dados adicionais para as observações
        const totalVisitas = parseInt(row.totalVisitas?.toString() || '0')
        const valorTotal = parseFloat(row.valorTotal?.toString() || '0')
        const ticketMedio = parseFloat(row.ticketMedio?.toString() || '0')
        const ultimaVisita = row.ultimaVisita ? new Date(row.ultimaVisita) : undefined
        const servicosRealizados = row.servicosRealizados ? 
          row.servicosRealizados.split(',').map(s => s.trim()).filter(s => s) : []

        await connectDB()
        
        // Verificar se o cliente já existe
        const existingClient = await Client.findOne({ email: processedClient.email })

        if (existingClient) {
          // Atualizar cliente existente
          // Preparar observações atualizadas
          const updatedNotes = `${processedClient.notes || existingClient.notes || ''}\n\nDADOS IMPORTADOS:\nTotal de visitas: ${totalVisitas}\nValor total: R$ ${valorTotal.toFixed(2)}\nTicket médio: R$ ${ticketMedio.toFixed(2)}\nÚltima visita: ${ultimaVisita ? ultimaVisita.toLocaleDateString('pt-BR') : 'Não informado'}\nServiços realizados: ${servicosRealizados.join(', ')}`

          const updatedClient = await Client.findByIdAndUpdate(
            existingClient._id,
            {
              name: processedClient.name,
              phone: processedClient.phone,
              birthDate: processedClient.birthDate,
              address: processedClient.address,
              notes: updatedNotes,
            },
            { new: true }
          )

          results.updated++
          results.details.push({
            action: 'updated',
            email: processedClient.email,
            name: processedClient.name
          })
        } else {
          // Criar novo cliente
          const hashedPassword = await bcrypt.hash('123456', 12) // Senha padrão
          
          // Preparar observações para novo cliente
          const newClientNotes = `${processedClient.notes}\n\nDADOS IMPORTADOS:\nTotal de visitas: ${totalVisitas}\nValor total: R$ ${valorTotal.toFixed(2)}\nTicket médio: R$ ${ticketMedio.toFixed(2)}\nÚltima visita: ${ultimaVisita ? ultimaVisita.toLocaleDateString('pt-BR') : 'Não informado'}\nServiços realizados: ${servicosRealizados.join(', ')}`

          const newClient = await Client.create({
            name: processedClient.name,
            email: processedClient.email,
            phone: processedClient.phone,
            birthDate: processedClient.birthDate,
            address: processedClient.address,
            notes: newClientNotes,
            password: hashedPassword
          })

          results.created++
          results.details.push({
            action: 'created',
            email: processedClient.email,
            name: processedClient.name
          })
        }

      } catch (error) {
        console.error(`Erro na linha ${rowNumber}:`, error)
        results.errors.push(`Linha ${rowNumber}: Erro interno - ${error}`)
      }
    }

    return NextResponse.json({
      message: 'Importação concluída',
      results
    })

  } catch (error) {
    console.error('Erro na importação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor durante importação' },
      { status: 500 }
    )
  }
}
