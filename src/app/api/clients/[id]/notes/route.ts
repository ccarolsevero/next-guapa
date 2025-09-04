import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = await params
    const { notes } = await request.json()
    
    console.log('🔍 === API CLIENTE NOTES - PUT ===')
    console.log('🔍 Atualizando observações do cliente ID:', id)
    console.log('📝 Observações:', notes)
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI!
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Atualizar as observações do cliente
    const result = await db.collection('clients').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          notes: notes,
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      console.log('❌ Cliente não encontrado')
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    if (result.modifiedCount === 0) {
      console.log('⚠️ Nenhuma alteração feita')
      return NextResponse.json(
        { error: 'Nenhuma alteração feita' },
        { status: 400 }
      )
    }
    
    console.log('✅ Observações atualizadas com sucesso')
    
    await client.close()
    
    return NextResponse.json({
      success: true,
      message: 'Observações atualizadas com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao atualizar observações do cliente:', error)
    
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('❌ Erro ao fechar conexão:', closeError)
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
