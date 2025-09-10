import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = await params
    console.log('🔍 === API CLIENTE DETALHES - GET ===')
    console.log('🔍 Buscando detalhes do cliente ID:', id)
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // 1. Buscar dados básicos do cliente
    const clientData = await db.collection('clients').findOne({
      _id: new ObjectId(id)
    })
    
    if (!clientData) {
      console.log('❌ Cliente não encontrado')
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('✅ Cliente encontrado:', clientData.name)
    
    // 2. Buscar comandas finalizadas do cliente
    const comandasFinalizadas = await db.collection('comandas').find({
      clienteId: id,
      status: 'finalizada'
    }).sort({ dataFim: -1 }).toArray()
    
    console.log('📊 Comandas finalizadas encontradas:', comandasFinalizadas.length)
    
    // 3. Buscar finalizações do cliente
    const finalizacoes = await db.collection('finalizacoes').find({
      clienteId: id,
      status: 'ativo'
    }).sort({ dataCriacao: -1 }).toArray()
    
    console.log('📊 Finalizações encontradas:', finalizacoes.length)
    
    // 4. Calcular estatísticas
    const totalGasto = finalizacoes.reduce((sum, f) => sum + (f.valorFinal || 0), 0)
    const totalVisitas = finalizacoes.length
    const ticketMedio = totalVisitas > 0 ? totalGasto / totalVisitas : 0
    
    // 5. Buscar primeira e última visita
    const primeiraVisita = finalizacoes.length > 0 ? finalizacoes[finalizacoes.length - 1].dataCriacao : null
    const ultimaVisita = finalizacoes.length > 0 ? finalizacoes[0].dataCriacao : null
    
    // 6. Calcular serviços favoritos
    const servicosFavoritos: { [key: string]: { count: number, totalSpent: number } } = {}
    
    finalizacoes.forEach(finalizacao => {
      if (finalizacao.servicos && Array.isArray(finalizacao.servicos)) {
        finalizacao.servicos.forEach((servico: any) => {
          const nomeServico = servico.nome || servico.name || 'Serviço não especificado'
          if (!servicosFavoritos[nomeServico]) {
            servicosFavoritos[nomeServico] = { count: 0, totalSpent: 0 }
          }
          servicosFavoritos[nomeServico].count += 1
          servicosFavoritos[nomeServico].totalSpent += servico.preco || servico.price || 0
        })
      }
    })
    
    const servicosFavoritosArray = Object.entries(servicosFavoritos)
      .map(([name, data]) => ({ name, count: data.count, totalSpent: data.totalSpent }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // 7. Preparar agendamentos (usando finalizações)
    const agendamentos = finalizacoes.map((finalizacao, index) => ({
      id: finalizacao._id,
      date: finalizacao.dataCriacao,
      service: finalizacao.servicos && finalizacao.servicos.length > 0 
        ? finalizacao.servicos[0].nome || finalizacao.servicos[0].name 
        : 'Serviço não especificado',
      professional: finalizacao.profissionalId || 'Profissional não especificado',
      status: 'COMPLETED',
      price: finalizacao.valorFinal || 0,
      notes: finalizacao.observacoes || ''
    }))
    
    // 8. Preparar pagamentos (usando finalizações)
    const pagamentos = finalizacoes.map((finalizacao, index) => ({
      id: finalizacao._id,
      date: finalizacao.dataCriacao,
      amount: finalizacao.valorFinal || 0,
      method: finalizacao.metodoPagamento || 'Não especificado',
      status: 'PAID'
    }))
    
    // 9. Calcular idade se tiver data de nascimento
    let idade = null
    if (clientData.birthDate) {
      const hoje = new Date()
      const nascimento = new Date(clientData.birthDate)
      idade = hoje.getFullYear() - nascimento.getFullYear()
      const mesDiff = hoje.getMonth() - nascimento.getMonth()
      if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--
      }
    }
    
    // 10. Formatar resposta
    const clienteDetalhado = {
      _id: clientData._id,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      birthDate: clientData.birthDate,
      address: clientData.address,
      notes: clientData.notes,
      idade: idade,
      
      // Estatísticas
      totalAppointments: totalVisitas,
      totalSpent: totalGasto,
      averageTicket: ticketMedio,
      firstVisit: primeiraVisita,
      lastVisit: ultimaVisita,
      
      // Serviços favoritos
      favoriteServices: servicosFavoritosArray,
      
      // Histórico
      appointments: agendamentos,
      payments: pagamentos,
      
      // Dados adicionais
      comandas: comandasFinalizadas.length,
      finalizacoes: finalizacoes.length
    }
    
    console.log('✅ Dados do cliente preparados com sucesso')
    console.log('📊 Estatísticas:', {
      totalVisitas: totalVisitas,
      totalGasto: totalGasto,
      ticketMedio: ticketMedio
    })
    
    await client.close()
    
    return NextResponse.json(clienteDetalhado)
    
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do cliente:', error)
    
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
export const dynamic = 'force-dynamic'
