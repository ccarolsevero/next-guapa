import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET() {
  let client;
  try {
    console.log('🔍 Debug MongoDB Connection...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa';
    console.log('🔗 MongoDB URI configurada:', mongoUri ? 'Sim' : 'Não');
    console.log('🔗 MongoDB URI (primeiros 20 chars):', mongoUri?.substring(0, 20) + '...');
    
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Verificar se a coleção users existe e tem dados
    const userCount = await usersCollection.countDocuments();
    console.log('📊 Total de usuários na coleção users:', userCount);
    
    const users = await usersCollection.find({}).toArray();
    const userList = users.map(user => ({
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    }));
    
    // Testar busca específica
    const brunaUser = await usersCollection.findOne({ 
      username: 'bruna',
      isActive: true 
    });
    
    const testeUser = await usersCollection.findOne({ 
      username: 'teste',
      isActive: true 
    });
    
    return NextResponse.json({
      success: true,
      mongoUriConfigured: !!mongoUri,
      mongoUriPreview: mongoUri?.substring(0, 20) + '...',
      connected: true,
      userCount,
      users: userList,
      brunaFound: !!brunaUser,
      testeFound: !!testeUser
    });
    
  } catch (error) {
    console.error('❌ Erro na conexão MongoDB:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      mongoUriConfigured: !!process.env.MONGODB_URI,
      mongoUriPreview: process.env.MONGODB_URI?.substring(0, 20) + '...'
    }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Desconectado do MongoDB');
    }
  }
}

export const dynamic = 'force-dynamic'
