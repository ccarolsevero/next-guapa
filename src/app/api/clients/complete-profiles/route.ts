import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

export async function GET(request: NextRequest) {
  try {
    console.log('=== INÍCIO GET /api/clients/complete-profiles ===')
    
    await connectDB()
    
    // Buscar clientes com perfil completo
    const completeClients = await Client.find({
      isCompleteProfile: true,
      onboardingCompleted: true
    })
    .select('-password') // Excluir senha
    .sort({ onboardingCompletedAt: -1 }) // Mais recentes primeiro
    .lean()

    console.log(`Encontrados ${completeClients.length} clientes com perfil completo`)

    // Formatar dados para o admin
    const formattedClients = completeClients.map(client => ({
      _id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      birthDate: client.birthDate,
      address: client.address,
      onboardingCompletedAt: client.onboardingCompletedAt,
      createdAt: client.createdAt,
      // Calcular idade se data de nascimento disponível
      age: client.birthDate ? 
        Math.floor((new Date().getTime() - new Date(client.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
        null
    }))

    return NextResponse.json({
      clients: formattedClients,
      total: formattedClients.length
    })

  } catch (error) {
    console.error('=== ERRO GET /api/clients/complete-profiles ===')
    console.error('Erro detalhado:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
