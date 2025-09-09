import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get('data') // formato: YYYY-MM-DD
    
    const { db } = await connectToDatabase()
    
    let dataConsulta: Date
    
    if (data) {
      // Se data específica for fornecida
      const [ano, mes, dia] = data.split('-').map(Number)
      dataConsulta = new Date(ano, mes - 1, dia)
    } else {
      // Se não, usar hoje
      dataConsulta = new Date()
    }
    
    const dataInicio = new Date(dataConsulta.getFullYear(), dataConsulta.getMonth(), dataConsulta.getDate())
    const dataFim = new Date(dataConsulta.getFullYear(), dataConsulta.getMonth(), dataConsulta.getDate(), 23, 59, 59)
    
    console.log('📅 Consultando faturamento para:', dataInicio.toISOString())
    
    // Buscar faturamento do dia
    const faturamento = await db.collection('faturamento').findOne({
      data: { 
        $gte: dataInicio, 
        $lte: dataFim 
      }
    })
    
    // Buscar comandas finalizadas do dia
    const comandasFinalizadas = await db.collection('comandas').find({
      status: 'finalizada',
      dataFim: { 
        $gte: dataInicio, 
        $lte: dataFim 
      }
    }).toArray()
    
    // Buscar finalizações do dia
    const finalizacoes = await db.collection('finalizacoes').find({
      dataCriacao: { 
        $gte: dataInicio, 
        $lte: dataFim 
      }
    }).toArray()
    
    const resultado = {
      data: dataInicio.toISOString().split('T')[0],
      faturamento: faturamento || {
        valorTotal: 0,
        totalComissoes: 0,
        quantidadeComandas: 0
      },
      comandasFinalizadas: comandasFinalizadas.length,
      finalizacoes: finalizacoes.length,
      detalhesComandas: comandasFinalizadas.map((c: any) => ({
        id: c._id,
        cliente: c.clienteNome,
        valor: c.valorFinal || c.valorTotal,
        dataFim: c.dataFim
      }))
    }
    
    console.log('💰 Faturamento encontrado:', resultado)
    
    return NextResponse.json(resultado)
    
  } catch (error) {
    console.error('❌ Erro ao consultar faturamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao consultar faturamento' },
      { status: 500 }
    )
  }
}
