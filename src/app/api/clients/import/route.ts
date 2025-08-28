import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

interface ExcelClient {
  nome: string
  email: string
  telefone: string
  dataNascimento?: string
  endereco?: string
  observacoes?: string
  totalVisitas?: number
  valorTotal?: number
  ultimaVisita?: string
  servicosRealizados?: string
  ticketMedio?: number
}

interface ProcessedClient {
  name: string
  email: string
  phone: string
  birthDate?: Date
  address?: string
  notes?: string
  totalAppointments: number
  totalSpent: number
  lastVisit?: Date
  averageTicket: number
  servicesHistory: string[]
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
        // Validar campos obrigatórios
        if (!row.nome || !row.email || !row.telefone) {
          results.errors.push(`Linha ${rowNumber}: Nome, email e telefone são obrigatórios`)
          continue
        }

        // Processar dados do cliente
        const processedClient: ProcessedClient = {
          name: row.nome.trim(),
          email: row.email.trim().toLowerCase(),
          phone: row.telefone.trim(),
          birthDate: row.dataNascimento ? new Date(row.dataNascimento) : undefined,
          address: row.endereco?.trim() || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
          notes: row.observacoes?.trim() || '',
          totalAppointments: parseInt(row.totalVisitas?.toString() || '0'),
          totalSpent: parseFloat(row.valorTotal?.toString() || '0'),
          lastVisit: row.ultimaVisita ? new Date(row.ultimaVisita) : undefined,
          averageTicket: parseFloat(row.ticketMedio?.toString() || '0'),
          servicesHistory: row.servicosRealizados ? 
            row.servicosRealizados.split(',').map(s => s.trim()).filter(s => s) : []
        }

        await connectDB()
        
        // Verificar se o cliente já existe
        const existingClient = await Client.findOne({ email: processedClient.email })

        if (existingClient) {
          // Atualizar cliente existente
          const updatedClient = await Client.findByIdAndUpdate(
            existingClient._id,
            {
              name: processedClient.name,
              phone: processedClient.phone,
              birthDate: processedClient.birthDate,
              address: processedClient.address,
              notes: processedClient.notes || existingClient.notes,
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
          
          const newClient = await Client.create({
            name: processedClient.name,
            email: processedClient.email,
            phone: processedClient.phone,
            birthDate: processedClient.birthDate,
            address: processedClient.address,
            notes: `${processedClient.notes}\n\nDADOS IMPORTADOS:\nTotal de visitas: ${processedClient.totalAppointments}\nValor total: R$ ${processedClient.totalSpent.toFixed(2)}\nTicket médio: R$ ${processedClient.averageTicket.toFixed(2)}\nÚltima visita: ${processedClient.lastVisit ? processedClient.lastVisit.toLocaleDateString('pt-BR') : 'Não informado'}\nServiços realizados: ${processedClient.servicesHistory.join(', ')}`,
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
