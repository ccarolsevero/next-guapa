import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  let client;
  try {
    const { username, password } = await request.json()
    console.log('🔐 Tentativa de login:', { username, passwordLength: password?.length })
    
    if (!username || !password) {
      console.log('❌ Username ou senha não fornecidos')
      return NextResponse.json(
        { error: 'Username e senha são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Conectar diretamente ao MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa';
    console.log('🔗 MongoDB URI configurada:', mongoUri ? 'Sim' : 'Não')
    console.log('🔗 MongoDB URI (primeiros 20 chars):', mongoUri?.substring(0, 20) + '...')
    
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ Conectado ao MongoDB')
    
    const db = client.db('guapa');
    const collection = db.collection('users');
    
    // Buscar usuário
    const searchQuery = { 
      username: username.toLowerCase(),
      isActive: true 
    }
    console.log('🔍 Buscando usuário com query:', searchQuery)
    
    const user = await collection.findOne(searchQuery);
    console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não')
    
    if (!user) {
      console.log('❌ Usuário não encontrado ou inativo')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    // Verificar senha
    console.log('🔑 Verificando senha...')
    console.log('📝 Senha fornecida:', password)
    console.log('🔐 Hash da senha no banco:', user.password?.substring(0, 20) + '...')
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('✅ Senha válida:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ Senha inválida')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    // Atualizar último login
    await collection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    // Retornar dados do usuário (sem senha)
    const { password: _, ...userData } = user;
    
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      professional: userData
    })
    
  } catch (error) {
    console.error('Erro no login do funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close();
    }
  }
}
