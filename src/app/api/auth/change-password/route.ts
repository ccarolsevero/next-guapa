import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    const { senhaAtual, novaSenha } = await request.json()
    
    console.log('🔍 === API CHANGE PASSWORD - POST ===')
    console.log('🔑 Alterando senha do usuário')
    
    // Validações básicas
    if (!senhaAtual || !novaSenha) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      )
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI!
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Buscar usuário admin (assumindo que há um usuário admin padrão)
    // Em produção, isso viria do contexto de autenticação
    const usuario = await db.collection('users').findOne({
      email: 'admin@espacoguapa.com' // Email padrão do admin
    })
    
    if (!usuario) {
      console.log('❌ Usuário admin não encontrado')
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.password)
    
    if (!senhaValida) {
      console.log('❌ Senha atual incorreta')
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 401 }
      )
    }
    
    // Criptografar nova senha
    const saltRounds = 12
    const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds)
    
    // Atualizar senha no banco
    const result = await db.collection('users').updateOne(
      { _id: usuario._id },
      { 
        $set: { 
          password: novaSenhaHash,
          updatedAt: new Date()
        }
      }
    )
    
    if (result.modifiedCount === 0) {
      console.log('❌ Nenhuma alteração feita')
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }
    
    console.log('✅ Senha alterada com sucesso')
    
    await client.close()
    
    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error)
    
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
