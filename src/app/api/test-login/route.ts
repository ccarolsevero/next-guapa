import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    console.log('🔌 Conectando diretamente ao MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const collection = db.collection('professionals');
    
    // Buscar profissional
    const professional = await collection.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    });
    
    console.log('👤 Profissional encontrado:', professional ? 'Sim' : 'Não');
    
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
    
    await client.close();
    
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      professional: {
        id: professional._id,
        name: professional.name,
        username: professional.username,
        role: professional.role
      }
    })
    
  } catch (error) {
    console.error('Erro no teste de login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
