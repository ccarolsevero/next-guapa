import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }
    
    console.log('🔍 === API UPLOAD - POST ===')
    console.log('📁 Arquivo recebido:', file.name)
    console.log('📊 Tamanho:', file.size, 'bytes')
    console.log('📋 Tipo:', file.type)
    
    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10MB.' }, { status: 400 })
    }
    
    // Validar tipos de arquivo permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Permitidos: JPG, PNG, GIF, PDF, DOC, DOCX, TXT' 
      }, { status: 400 })
    }
    
    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'recomendacoes')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    
    // Converter arquivo para buffer e salvar
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // URL pública do arquivo
    const fileUrl = `/uploads/recomendacoes/${fileName}`
    
    console.log('✅ Arquivo salvo com sucesso:', fileUrl)
    
    return NextResponse.json({
      success: true,
      file: {
        nome: file.name,
        url: fileUrl,
        tipo: file.type,
        tamanho: file.size,
        dataUpload: new Date()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
