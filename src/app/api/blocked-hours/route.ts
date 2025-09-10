import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BlockedHours from '@/models/BlockedHours';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    // Construir filtros
    const filters: any = {};
    
    if (professionalId) {
      filters.professionalId = new ObjectId(professionalId);
    }
    
    if (type) {
      filters.type = type;
    }
    
    if (isActive !== null) {
      filters.isActive = isActive === 'true';
    }

    const blockedHours = await BlockedHours.find(filters)
      .populate('professionalId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: blockedHours
    });

  } catch (error) {
    console.error('Erro ao buscar horários bloqueados:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      professionalId,
      type,
      title,
      description,
      dayOfWeek,
      startTime,
      endTime,
      startDate,
      endDate,
      isRecurring,
      recurringPattern,
      createdBy
    } = body;

    // Validações básicas
    if (!professionalId || !type || !title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: professionalId, type, title, startTime, endTime' },
        { status: 400 }
      );
    }

    // Validar formato de horário
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { success: false, error: 'Formato de horário inválido. Use HH:MM' },
        { status: 400 }
      );
    }

    // Validar se horário de início é menor que fim
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { success: false, error: 'Horário de início deve ser menor que horário de fim' },
        { status: 400 }
      );
    }

    // Validar dayOfWeek se for bloqueio semanal
    if (type === 'weekly' && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return NextResponse.json(
        { success: false, error: 'dayOfWeek deve estar entre 0 (domingo) e 6 (sábado)' },
        { status: 400 }
      );
    }

    // Validar datas se for bloqueio por período
    if (type === 'date_range' && (!startDate || !endDate)) {
      return NextResponse.json(
        { success: false, error: 'startDate e endDate são obrigatórios para bloqueios por período' },
        { status: 400 }
      );
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { success: false, error: 'Data de início deve ser menor que data de fim' },
        { status: 400 }
      );
    }

    const blockedHour = new BlockedHours({
      professionalId: new ObjectId(professionalId),
      type,
      title,
      description: description || '',
      dayOfWeek,
      startTime,
      endTime,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || 'weekly',
      createdBy: new ObjectId(createdBy)
    });

    await blockedHour.save();

    // Popular dados relacionados
    await blockedHour.populate('professionalId', 'name');
    await blockedHour.populate('createdBy', 'name');

    return NextResponse.json({
      success: true,
      data: blockedHour,
      message: 'Horário bloqueado criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar horário bloqueado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
