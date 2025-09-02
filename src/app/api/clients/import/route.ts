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
  [key: string]: string | number | undefined // Permite qualquer coluna
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
    console.log('🚀 === INÍCIO IMPORTAÇÃO ===')
    
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
    
    // Validar tamanho do arquivo (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(0)}MB` },
        { status: 400 }
      )
    }

    console.log(`📁 Arquivo recebido: ${file.name} (${file.size} bytes)`)

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

    console.log(`📊 Total de linhas para processar: ${jsonData.length}`)

    const results = {
      total: jsonData.length,
      created: 0,
      updated: 0,
      errors: [] as string[],
      details: [] as Array<{ action: 'created' | 'updated'; email: string; name: string }>
    }

    // Conectar ao MongoDB uma vez
    try {
      await connectDB()
      console.log('✅ Conectado ao MongoDB')
    } catch (dbError) {
      console.error('❌ Erro de conexão com MongoDB:', dbError)
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 500 }
      )
    }

    // Processar cada linha sequencialmente (mais seguro para grandes volumes)
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i]
      const rowNumber = i + 2 // +2 porque a primeira linha é cabeçalho e arrays começam em 0

      try {
        // Mapeamento automático baseado no conteúdo das colunas
        let nome = ''
        let email = ''
        let telefone = ''
        let dataCadastro = ''
        
        // Procurar por nome (primeira coluna ou coluna com "nome", "cliente", etc.)
        for (const [key, value] of Object.entries(row)) {
          const keyLower = key.toLowerCase()
          const valueStr = String(value || '').trim()
          
          // Mapeamento mais inteligente para nome
          if (!nome && (
            keyLower.includes('nome') || 
            keyLower.includes('cliente') || 
            keyLower === 'cliente' ||
            key === '1' || 
            key === 'A' ||
            key === 'Cliente' ||
            key === 'cliente'
          )) {
            nome = valueStr
          }
          
          // Mapeamento mais inteligente para email
          if (!email && (
            keyLower.includes('email') || 
            key === 'F' || 
            valueStr.includes('@') ||
            keyLower === 'email'
          )) {
            email = valueStr
          }
          
          // Mapeamento mais inteligente para telefone
          if (!telefone && (
            keyLower.includes('telefone') || 
            keyLower.includes('celular') || 
            keyLower === 'celular' ||
            key === 'E' || 
            keyLower.includes('phone') ||
            key === 'Celular' ||
            key === 'celular'
          )) {
            telefone = valueStr
          }
          
          // Mapeamento mais inteligente para data
          if (!dataCadastro && (
            keyLower.includes('data') || 
            keyLower.includes('cadastro') || 
            keyLower === 'cadastrado' ||
            key === 'R' ||
            key === 'Cadastrado'
          )) {
            dataCadastro = valueStr
          }
        }
        
        // Validar campos obrigatórios (apenas nome e telefone são obrigatórios)
        if (!nome || !telefone) {
          results.errors.push(`Linha ${rowNumber}: Nome e telefone são obrigatórios. Encontrado: nome="${nome}", telefone="${telefone}". Colunas disponíveis: ${Object.keys(row).join(', ')}`)
          continue
        }
        
        // Se não tiver email, gerar um baseado no nome
        if (!email) {
          const nomeNormalizado = nome.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '.') // Substitui espaços por pontos
            .trim()
          email = `${nomeNormalizado}@guapa.com`
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

        // Verificar se o cliente já existe
        let existingClient
        try {
          existingClient = await Client.findOne({ email: processedClient.email })
        } catch (findError) {
          console.error(`Erro ao buscar cliente na linha ${rowNumber}:`, findError)
          results.errors.push(`Linha ${rowNumber}: Erro ao buscar cliente existente`)
          // Pular para próxima linha
          continue
        }

        if (existingClient) {
          // Atualizar cliente existente
          const updatedNotes = `${processedClient.notes || existingClient.notes || ''}\n\nDADOS IMPORTADOS:\nTotal de visitas: ${totalVisitas}\nValor total: R$ ${valorTotal.toFixed(2)}\nTicket médio: R$ ${ticketMedio.toFixed(2)}\nÚltima visita: ${ultimaVisita ? ultimaVisita.toLocaleDateString('pt-BR') : 'Não informado'}\nServiços realizados: ${servicosRealizados.join(', ')}`

          try {
            await Client.findByIdAndUpdate(
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
          } catch (updateError) {
            console.error(`Erro ao atualizar cliente na linha ${rowNumber}:`, updateError)
            results.errors.push(`Linha ${rowNumber}: Erro ao atualizar cliente`)
            continue
          }
        } else {
          // Criar novo cliente
          const hashedPassword = await bcrypt.hash('123456', 12) // Senha padrão
          
          // Preparar observações para novo cliente
          const newClientNotes = `${processedClient.notes}\n\nDADOS IMPORTADOS:\nTotal de visitas: ${totalVisitas}\nValor total: R$ ${valorTotal.toFixed(2)}\nTicket médio: R$ ${ticketMedio.toFixed(2)}\nÚltima visita: ${ultimaVisita ? ultimaVisita.toLocaleDateString('pt-BR') : 'Não informado'}\nServiços realizados: ${servicosRealizados.join(', ')}`

          try {
            await Client.create({
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
          } catch (createError) {
            console.error(`Erro ao criar cliente na linha ${rowNumber}:`, createError)
            results.errors.push(`Linha ${rowNumber}: Erro ao criar cliente`)
            continue
          }
        }

        // Log de progresso a cada 100 linhas
        if ((i + 1) % 100 === 0) {
          console.log(`📊 Progresso: ${i + 1}/${jsonData.length} linhas processadas`)
        }

      } catch (error) {
        console.error(`Erro na linha ${rowNumber}:`, error)
        
        let errorMsg = 'Erro interno desconhecido'
        if (error instanceof Error) {
          errorMsg = error.message
        } else if (typeof error === 'string') {
          errorMsg = error
        }
        
        results.errors.push(`Linha ${rowNumber}: Erro interno - ${errorMsg}`)
      }
    }

    console.log(`✅ Importação concluída: ${results.created} criados, ${results.updated} atualizados, ${results.errors.length} erros`)

    return NextResponse.json({
      message: 'Importação concluída',
      results
    })

  } catch (error) {
    console.error('❌ Erro na importação:', error)
    
    // Retornar erro em formato JSON válido
    let errorMessage = 'Erro interno do servidor durante importação'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || ''
    } else if (typeof error === 'string') {
      errorMessage = error
    } else {
      errorMessage = 'Erro desconhecido durante importação'
    }
    
    console.error('Detalhes do erro:', { errorMessage, errorDetails })
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
