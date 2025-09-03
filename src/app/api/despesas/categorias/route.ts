import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const categorias = await db.collection('categorias_despesas').find({}).sort({ nome: 1 }).toArray()
    
    return NextResponse.json({ success: true, data: categorias })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome } = await request.json()
    
    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Verificar se já existe uma categoria com esse nome
    const categoriaExistente = await db.collection('categorias_despesas').findOne({ 
      nome: nome.trim() 
    })
    
    if (categoriaExistente) {
      return NextResponse.json(
        { success: false, error: 'Categoria já existe' },
        { status: 400 }
      )
    }
    
    const novaCategoria = {
      nome: nome.trim(),
      createdAt: new Date()
    }
    
    const result = await db.collection('categorias_despesas').insertOne(novaCategoria)
    
    return NextResponse.json({ 
      success: true, 
      data: { ...novaCategoria, _id: result.insertedId } 
    })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
