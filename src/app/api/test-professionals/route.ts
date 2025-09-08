import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    const { db } = await connectToDatabase()
    console.log('✅ Conectado ao banco de dados');
    
    // Listar todos os profissionais diretamente do banco
    const professionals = await db.collection('professionals').find({}).toArray()
    console.log('📋 Profissionais encontrados:', professionals.length);
    
    return NextResponse.json({
      message: 'Teste de conexão com profissionais',
      count: professionals.length,
      professionals: professionals.map(p => ({
        id: p._id,
        name: p.name,
        username: p.username,
        role: p.role,
        isActive: p.isActive,
        hasPassword: !!p.password
      }))
    })
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}
