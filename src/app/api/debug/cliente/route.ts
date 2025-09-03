import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('id')
    const clienteNome = searchParams.get('nome')
    
    if (!clienteId && !clienteNome) {
      return NextResponse.json(
        { error: 'ID ou nome do cliente é obrigatório' },
        { status: 400 }
      )
    }

    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('🔍 Debug cliente - Conectado ao banco')
    
    let query: any = {}
    
    if (clienteId) {
      query._id = clienteId
      console.log('🔍 Buscando por ID:', clienteId)
    } else if (clienteNome) {
      query.name = { $regex: clienteNome, $options: 'i' }
      console.log('🔍 Buscando por nome:', clienteNome)
    }
    
    // Buscar cliente
    const cliente = await db.collection('clients').findOne(query)
    console.log('🔍 Cliente encontrado:', cliente ? 'SIM' : 'NÃO')
    
    if (cliente) {
      console.log('🔍 Dados do cliente:', {
        id: cliente._id,
        nome: cliente.name,
        email: cliente.email,
        telefone: cliente.phone
      })
    }
    
    // Buscar comandas relacionadas
    const comandas = await db.collection('comandas').find({
      clientId: clienteId || cliente?._id
    }).toArray()
    
    console.log('🔍 Comandas encontradas:', comandas.length)
    
    // Buscar finalizações relacionadas
    const finalizacoes = await db.collection('finalizacoes').find({
      clienteId: clienteId || cliente?._id
    }).toArray()
    
    console.log('🔍 Finalizações encontradas:', finalizacoes.length)
    
    // Fechar conexão
    await client.close()
    
    return NextResponse.json({
      cliente: cliente,
      comandas: comandas.length,
      finalizacoes: finalizacoes.length,
      debug: {
        clienteId: clienteId,
        clienteNome: clienteNome,
        clienteEncontrado: !!cliente,
        comandasEncontradas: comandas.length,
        finalizacoesEncontradas: finalizacoes.length
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
