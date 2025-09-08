import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e senha são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Conectar diretamente ao MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    
    const db = client.db('guapa');
    const collection = db.collection('professionals');
    
    // Buscar profissional
    const professional = await collection.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    });
    
    if (!professional) {
      await client.close();
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, professional.password);
    
    if (!isPasswordValid) {
      await client.close();
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: professional._id.toString(),
        username: professional.username,
        role: professional.role,
        name: professional.name
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    await client.close();
    
    // Retornar dados do profissional (sem senha)
    const { password: _, ...professionalData } = professional;
    
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      professional: professionalData
    })
    
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
