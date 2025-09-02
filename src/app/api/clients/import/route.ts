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
    const startFromBatch = formData.get('startFromBatch') ? parseInt(formData.get('startFromBatch') as string) : 0
    
    console.log(`📦 Importação configurada para começar do lote: ${startFromBatch || 'automático'}`)

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
      details: [] as Array<{ action: 'created' | 'updated'; email: string; name: string }>,
      currentPart: startFromBatch,
      totalParts: 1
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

    // Processar arquivos grandes em partes menores para evitar timeout
    const maxClientsPerBatch = 300 // Reduzido para 300 para garantir que caiba no timeout
    const totalClients = jsonData.length
    const needsBatching = totalClients > maxClientsPerBatch
    
    if (needsBatching) {
      const totalParts = Math.ceil(totalClients / maxClientsPerBatch)
      
      // Se não especificou lote inicial, detectar automaticamente onde parou
      let currentPart = startFromBatch
      if (currentPart === 0) {
        try {
          const existingClientsCount = await Client.countDocuments()
          // Calcular a próxima parte baseada no número de clientes existentes
          // Se temos 900 clientes e cada parte tem 300, já processamos 3 partes (1,2,3)
          // Então a próxima parte deve ser a 4
          currentPart = Math.ceil(existingClientsCount / maxClientsPerBatch)
          
          // Se já processou tudo, começar do início
          if (currentPart >= totalParts) {
            currentPart = 1
            console.log('🔄 Todos os clientes já foram importados. Começando do início...')
          } else {
            // Ajustar para a próxima parte (não a atual)
            currentPart = currentPart + 1
            console.log(`🔄 Detectado automaticamente: continuar da parte ${currentPart}/${totalParts}`)
          }
        } catch (error) {
          console.log('⚠️ Erro ao detectar progresso, começando da parte 1')
          currentPart = 1
        }
      }
      
      results.totalParts = totalParts
      results.currentPart = currentPart
      
      if (currentPart > totalParts) {
        return NextResponse.json({
          error: `Parte ${currentPart} não existe. Total de partes: ${totalParts}`,
          totalParts,
          currentPart
        }, { status: 400 })
      }
      
      // Calcular índices para a parte atual
      const startIndex = (currentPart - 1) * maxClientsPerBatch
      const endIndex = Math.min(startIndex + maxClientsPerBatch, totalClients)
      const partData = jsonData.slice(startIndex, endIndex)
      
      console.log(`📦 Processando parte ${currentPart}/${totalParts}: clientes ${startIndex + 1} a ${endIndex}`)
      
      // Processar apenas esta parte
      await processClientBatch(partData, startIndex, results)
      
    } else {
      // Para arquivos pequenos, processar normalmente
      console.log('📦 Arquivo pequeno, processando normalmente')
      await processClientBatch(jsonData, 0, results)
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

// Função auxiliar para processar lote de clientes
async function processClientBatch(clientData: ExcelClient[], startIndex: number, results: {
  total: number
  created: number
  updated: number
  errors: string[]
  details: Array<{ action: 'created' | 'updated'; email: string; name: string }>
  currentPart: number
  totalParts: number
}) {
  const batchSize = 50 // Processar 50 clientes por vez
  const batches = []
  
  for (let i = 0; i < clientData.length; i += batchSize) {
    const batch = clientData.slice(i, i + batchSize)
    batches.push({
      data: batch,
      startIndex: startIndex + i,
      batchNumber: Math.floor(i / batchSize) + 1
    })
  }
  
  console.log(`📦 Processando ${batches.length} lotes de ${batchSize} clientes cada`)
  
  // Processar lotes sequencialmente para evitar timeout
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const { data: batchData, startIndex, batchNumber } = batch
    
    console.log(`🚀 Processando lote ${batchNumber}/${batches.length}`)
    
    // Processar cada linha do lote
    for (let j = 0; j < batchData.length; j++) {
      const row = batchData[j]
      const rowNumber = startIndex + j + 2 // +2 porque a primeira linha é cabeçalho e arrays começam em 0

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
          
          // Mapeamento mais inteligente para data (apenas se for uma data válida)
          if (!dataCadastro && (
            keyLower.includes('data') || 
            keyLower.includes('cadastro') || 
            keyLower === 'cadastrado' ||
            key === 'R' ||
            key === 'Cadastrado'
          )) {
            // Validar se é uma data válida antes de usar
            if (valueStr && valueStr !== '') {
              const testDate = new Date(valueStr)
              if (!isNaN(testDate.getTime()) && testDate.getTime() > 0) {
                dataCadastro = valueStr
              }
            }
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
          birthDate: undefined, // Inicialmente undefined
          address: row.endereco?.trim() || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
          notes: row.observacoes?.trim() || ''
        }
        
        // Processar data de nascimento apenas se for válida
        if (dataCadastro && dataCadastro.trim() !== '') {
          try {
            const parsedDate = new Date(dataCadastro)
            if (!isNaN(parsedDate.getTime()) && parsedDate.getTime() > 0) {
              processedClient.birthDate = parsedDate
            }
          } catch (dateError) {
            console.log(`⚠️ Data inválida na linha ${rowNumber}: "${dataCadastro}" - ignorando`)
          }
        }

        // Preparar dados adicionais para as observações
        const totalVisitas = parseInt(row.totalVisitas?.toString() || '0')
        const valorTotal = parseFloat(row.valorTotal?.toString() || '0')
        const ticketMedio = parseFloat(row.ticketMedio?.toString() || '0')
        const ultimaVisita = row.ultimaVisita ? new Date(row.ultimaVisita) : undefined
        const servicosRealizados = row.servicosRealizados ? 
          row.servicosRealizados.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []

        // Verificar se o cliente já existe
        let existingClient
        try {
          existingClient = await Client.findOne({ email: processedClient.email })
        } catch (findError) {
          console.error(`Erro ao buscar cliente na linha ${rowNumber}:`, findError)
          results.errors.push(`Linha ${rowNumber}: Erro ao buscar cliente existente`)
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
        if ((j + 1) % 100 === 0) {
          console.log(`📊 Progresso lote ${batchNumber}: ${j + 1}/${batchData.length} linhas`)
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
    
    // Log de conclusão do lote
    console.log(`✅ Lote ${batchNumber} concluído`)
  }
}
