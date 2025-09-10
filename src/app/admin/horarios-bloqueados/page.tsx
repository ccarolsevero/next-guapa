'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Users,
  Coffee,
  Plane,
  Settings
} from 'lucide-react';

interface Professional {
  _id: string;
  name: string;
}

interface BlockedHour {
  _id: string;
  professionalId: {
    _id: string;
    name: string;
  };
  type: 'weekly' | 'date_range' | 'lunch_break' | 'vacation' | 'custom';
  title: string;
  description: string;
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
  isRecurring: boolean;
  recurringPattern: string;
  isActive: boolean;
  createdAt: string;
}

const typeLabels = {
  weekly: 'Semanal',
  date_range: 'Período',
  lunch_break: 'Almoço',
  vacation: 'Folga',
  custom: 'Personalizado'
};

const typeIcons = {
  weekly: Calendar,
  date_range: Calendar,
  lunch_break: Coffee,
  vacation: Plane,
  custom: Settings
};

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function BlockedHoursPage() {
  const [blockedHours, setBlockedHours] = useState<BlockedHour[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockedHour | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar profissionais
      const professionalsRes = await fetch('/api/professionals');
      const professionalsData = await professionalsRes.json();
      if (professionalsData.success) {
        setProfessionals(professionalsData.data);
      }

      // Carregar horários bloqueados
      const blockedRes = await fetch('/api/blocked-hours');
      const blockedData = await blockedRes.json();
      if (blockedData.success) {
        setBlockedHours(blockedData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este bloqueio?')) return;

    try {
      const response = await fetch(`/api/blocked-hours/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBlockedHours(blockedHours.filter(block => block._id !== id));
      } else {
        alert('Erro ao remover bloqueio');
      }
    } catch (error) {
      console.error('Erro ao remover bloqueio:', error);
      alert('Erro ao remover bloqueio');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/blocked-hours/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        setBlockedHours(blockedHours.map(block => 
          block._id === id ? { ...block, isActive: !currentStatus } : block
        ));
      } else {
        alert('Erro ao alterar status do bloqueio');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do bloqueio');
    }
  };

  const filteredBlocks = blockedHours.filter(block => {
    if (selectedProfessional && block.professionalId._id !== selectedProfessional) return false;
    if (selectedType && block.type !== selectedType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horários Bloqueados</h1>
          <p className="text-gray-600">Gerencie os horários bloqueados por profissional</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Bloqueio
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profissional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
            >
              <option value="">Todos os profissionais</option>
              {professionals.map(prof => (
                <option key={prof._id} value={prof._id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de bloqueios */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredBlocks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum horário bloqueado encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlocks.map((block) => {
                  const TypeIcon = typeIcons[block.type];
                  return (
                    <tr key={block._id} className={!block.isActive ? 'opacity-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          {block.professionalId.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TypeIcon className="w-4 h-4 text-gray-400 mr-2" />
                          {typeLabels[block.type]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {block.title}
                          </div>
                          {block.description && (
                            <div className="text-sm text-gray-500">
                              {block.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {block.startTime} - {block.endTime}
                          {block.type === 'weekly' && block.dayOfWeek !== undefined && (
                            <span className="ml-2 text-gray-500">
                              ({dayNames[block.dayOfWeek]})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(block._id, block.isActive)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            block.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {block.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingBlock(block);
                              setShowModal(true);
                            }}
                            className="text-[#D15556] hover:text-[#c04546]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(block._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal será implementado na próxima etapa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingBlock ? 'Editar Bloqueio' : 'Novo Bloqueio'}
            </h2>
            <p className="text-gray-600 mb-4">
              Modal será implementado na próxima etapa
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBlock(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
