import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 === INÍCIO PREVIEW ===')
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ Nenhum arquivo enviado')
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }
    
    console.log(`📁 Arquivo recebido: ${file.name} (${file.size} bytes, tipo: ${file.type})`)

    // Validar tipo de arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      console.log(`❌ Formato inválido: ${file.name}`)
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Use .xlsx ou .xls' },
        { status: 400 }
      )
    }
    
    console.log('✅ Formato de arquivo válido')

    // Ler arquivo Excel
    console.log('📖 Lendo arquivo Excel...')
    const buffer = await file.arrayBuffer()
    console.log(`📊 Buffer criado: ${buffer.byteLength} bytes`)
    
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    console.log(`📋 Planilhas encontradas: ${workbook.SheetNames.join(', ')}`)
    
    // Pegar primeira planilha
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    console.log(`📄 Usando planilha: ${sheetName}`)
    
    // Converter para JSON
    console.log('🔄 Convertendo para JSON...')
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    console.log(`📊 Dados convertidos: ${jsonData.length} linhas`)

    if (!jsonData || jsonData.length === 0) {
      console.log('❌ Planilha vazia ou formato inválido')
      return NextResponse.json(
        { error: 'Planilha vazia ou formato inválido' },
        { status: 400 }
      )
    }

    // Mostrar estrutura das primeiras linhas
    console.log('📋 Estrutura dos dados:')
    if (jsonData.length > 0) {
      console.log('   Primeira linha:', Object.keys(jsonData[0] as any))
      console.log('   Segunda linha:', Object.keys((jsonData[1] as any) || {}))
    }

    // Retornar preview (primeiros 10 registros)
    const preview = jsonData.slice(0, 10)
    console.log(`✅ Preview criado com ${preview.length} registros`)

    return NextResponse.json({
      total: jsonData.length,
      preview,
      message: `Arquivo processado com ${jsonData.length} registros`
    })

  } catch (error) {
    console.error('❌ Erro ao processar preview:', error)
    
    let errorMessage = 'Erro interno do servidor durante processamento'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || ''
    } else if (typeof error === 'string') {
      errorMessage = error
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
