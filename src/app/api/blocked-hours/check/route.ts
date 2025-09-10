import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BlockedHours from '@/models/BlockedHours';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { professionalId, date, time } = body;

    if (!professionalId || !date) {
      return NextResponse.json(
        { success: false, error: 'professionalId e date são obrigatórios' },
        { status: 400 }
      );
    }

    const checkDate = new Date(date);
    const dayOfWeek = checkDate.getDay(); // 0 = domingo, 1 = segunda, etc.

    // Buscar todos os bloqueios ativos para o profissional
    const blockedHours = await BlockedHours.find({
      professionalId: new ObjectId(professionalId),
      isActive: true
    });

    const blockedTimes: any[] = [];

    for (const blocked of blockedHours) {
      let isBlocked = false;

      switch (blocked.type) {
        case 'weekly':
          // Verificar se é o dia da semana correto
          if (blocked.dayOfWeek === dayOfWeek) {
            isBlocked = true;
          }
          break;

        case 'date_range':
          // Verificar se a data está no período bloqueado
          if (blocked.startDate && blocked.endDate) {
            const startDate = new Date(blocked.startDate);
            const endDate = new Date(blocked.endDate);
            if (checkDate >= startDate && checkDate <= endDate) {
              isBlocked = true;
            }
          }
          break;

        case 'lunch_break':
        case 'vacation':
        case 'custom':
          // Para estes tipos, verificar se a data está no período
          if (blocked.startDate && blocked.endDate) {
            const startDate = new Date(blocked.startDate);
            const endDate = new Date(blocked.endDate);
            if (checkDate >= startDate && checkDate <= endDate) {
              isBlocked = true;
            }
          } else if (blocked.dayOfWeek === dayOfWeek) {
            // Se não tem período específico, verificar por dia da semana
            isBlocked = true;
          }
          break;
      }

      if (isBlocked) {
        // Se foi fornecido um horário específico, verificar se está no intervalo bloqueado
        if (time) {
          const [checkHour, checkMin] = time.split(':').map(Number);
          const [startHour, startMin] = blocked.startTime.split(':').map(Number);
          const [endHour, endMin] = blocked.endTime.split(':').map(Number);
          
          const checkMinutes = checkHour * 60 + checkMin;
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          
          if (checkMinutes >= startMinutes && checkMinutes < endMinutes) {
            blockedTimes.push({
              id: blocked._id,
              title: blocked.title,
              description: blocked.description,
              type: blocked.type,
              startTime: blocked.startTime,
              endTime: blocked.endTime,
              isRecurring: blocked.isRecurring
            });
          }
        } else {
          // Se não foi fornecido horário específico, retornar todos os bloqueios do dia
          blockedTimes.push({
            id: blocked._id,
            title: blocked.title,
            description: blocked.description,
            type: blocked.type,
            startTime: blocked.startTime,
            endTime: blocked.endTime,
            isRecurring: blocked.isRecurring
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        date: date,
        professionalId: professionalId,
        blockedTimes: blockedTimes,
        isBlocked: blockedTimes.length > 0
      }
    });

  } catch (error) {
    console.error('Erro ao verificar horários bloqueados:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
