import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Professional from '@/models/Professional'

export async function GET() {
  try {
    console.log('Buscando Cicera no MongoDB...')
    
    await connectDB()
    const cicera = await Professional.findOne({ name: { $regex: /cicera/i } })
    
    if (!cicera) {
      console.log('Cicera não encontrada no banco')
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
    }
    
    console.log('Cicera encontrada:', cicera.name)
    return NextResponse.json(cicera)
  } catch (error) {
    console.error('Erro ao buscar Cicera:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
