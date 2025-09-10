import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BlockedHours from '@/models/BlockedHours';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const blockedHour = await BlockedHours.findById(id)
      .populate('professionalId', 'name')
      .populate('createdBy', 'name');

    if (!blockedHour) {
      return NextResponse.json(
        { success: false, error: 'Horário bloqueado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blockedHour
    });

  } catch (error) {
    console.error('Erro ao buscar horário bloqueado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();
    const {
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
      isActive
    } = body;

    // Validações básicas
    if (startTime && endTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return NextResponse.json(
          { success: false, error: 'Formato de horário inválido. Use HH:MM' },
          { status: 400 }
        );
      }

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
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : undefined;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : undefined;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurringPattern !== undefined) updateData.recurringPattern = recurringPattern;
    if (isActive !== undefined) updateData.isActive = isActive;

    const blockedHour = await BlockedHours.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('professionalId', 'name')
      .populate('createdBy', 'name');

    if (!blockedHour) {
      return NextResponse.json(
        { success: false, error: 'Horário bloqueado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blockedHour,
      message: 'Horário bloqueado atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar horário bloqueado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const blockedHour = await BlockedHours.findByIdAndDelete(id);

    if (!blockedHour) {
      return NextResponse.json(
        { success: false, error: 'Horário bloqueado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Horário bloqueado removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover horário bloqueado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
