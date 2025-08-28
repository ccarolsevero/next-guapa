import { NextRequest, NextResponse } from 'next/server'
import { localDB } from '@/lib/localStorage'

export async function POST(request: NextRequest) {
  try {
    const clientData = await request.json()
    console.log('Recebendo dados de cliente para sincronização:', clientData)

    // Salvar no localStorage do admin
    await localDB.receiveClientData(clientData)
    
    console.log('Cliente sincronizado com sucesso no admin')
    return NextResponse.json({ success: true, message: 'Cliente sincronizado com sucesso' })
  } catch (error) {
    console.error('Erro ao sincronizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Verificar se há dados pendentes para sincronização
    const hasPending = await localDB.hasPendingData()
    return NextResponse.json({ hasPending })
  } catch (error) {
    console.error('Erro ao verificar dados pendentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
