import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const despesas = await db.collection('despesas').find({}).sort({ data: -1 }).toArray()
    
    return NextResponse.json({ success: true, data: despesas })
  } catch (error) {
    console.error('Erro ao buscar despesas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { valor, categoria, observacao, tipo } = await request.json()
    
    if (!valor || !categoria || !tipo) {
      return NextResponse.json(
        { success: false, error: 'Valor, categoria e tipo são obrigatórios' },
        { status: 400 }
      )
    }
    
    const { db } = await connectToDatabase()
    
    const novaDespesa = {
      valor: parseFloat(valor),
      categoria,
      observacao: observacao || '',
      tipo: tipo as 'fixa' | 'variavel',
      data: new Date(),
      createdAt: new Date()
    }
    
    const result = await db.collection('despesas').insertOne(novaDespesa)
    
    return NextResponse.json({ 
      success: true, 
      data: { ...novaDespesa, _id: result.insertedId } 
    })
  } catch (error) {
    console.error('Erro ao criar despesa:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
