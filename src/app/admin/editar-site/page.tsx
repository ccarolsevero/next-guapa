'use client'

import { useState, useEffect } from 'react'
import { Upload, Save, Trash2, Plus, Edit, Image, User, FileText, Settings, Move } from 'lucide-react'
import { uploadImage, deleteImage } from '@/lib/upload'

interface Professional {
  id: string
  name: string
  title: string
  profileImage: string
  gallery: string[]
  description: string
  services: string[]
}

interface HomeGallery {
  id: string
  imageUrl: string
  order: number
}

export default function EditarSitePage() {
  const [activeTab, setActiveTab] = useState('home-gallery')
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [homeGallery, setHomeGallery] = useState<HomeGallery[]>([])
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [showAddProfessional, setShowAddProfessional] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar dados do banco
  useEffect(() => {
    loadHomeGallery()
    loadProfessionals()
  }, [])

  const loadHomeGallery = async () => {
    try {
      const response = await fetch('/api/home-gallery')
      if (response.ok) {
        const data = await response.json()
        setHomeGallery(data || [])
      } else {
        console.error('Erro ao carregar galeria da home')
      }
    } catch (error) {
      console.error('Erro ao carregar galeria:', error)
    }
  }

  const loadProfessionals = async () => {
    try {
      // Por enquanto, vamos usar dados de exemplo
      setProfessionals([
        {
          id: '1',
          name: 'Bruna',
          title: 'Cabeleireira Visagista',
          profileImage: '/assents/fotobruna.jpeg',
          gallery: [],
          description: 'Especialista em cabelos naturais e visagismo',
          services: ['Corte', 'Coloração', 'Tratamento', 'Consultoria']
        }
      ])
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'home-gallery' | 'professional-gallery' | 'profile') => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      try {
        console.log('Iniciando upload de:', file.name, 'tamanho:', file.size, 'tipo:', file.type)
        
        let folder = ''
        switch (type) {
          case 'home-gallery':
            folder = 'home-gallery'
            break
          case 'professional-gallery':
            folder = 'professional-gallery'
            break
          case 'profile':
            folder = 'profiles'
            break
        }

        console.log('Fazendo upload para pasta:', folder)
        const imageUrl = await uploadImage(file, folder)
        console.log('Upload concluído, URL:', imageUrl)
        
        if (type === 'home-gallery') {
          // Adicionar nova foto à galeria da home usando nossa API
          console.log('Salvando foto no banco de dados...')
          const response = await fetch('/api/home-gallery', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl })
          })

          if (response.ok) {
            const newPhoto = await response.json()
            console.log('Foto adicionada com sucesso:', newPhoto)
            await loadHomeGallery() // Recarregar a galeria
            alert('Foto adicionada com sucesso!')
          } else {
            const errorData = await response.json()
            console.error('Erro ao adicionar foto:', errorData)
            alert(`Erro ao adicionar foto: ${errorData.error || 'Erro desconhecido'}`)
          }
        } else if (type === 'professional-gallery') {
          // Adicionar foto à galeria do profissional
          const professionalId = e.currentTarget.id?.replace('gallery-upload-', '')
          if (professionalId) {
            // Por enquanto, apenas atualizar o estado local
            setProfessionals(professionals.map(p => 
              p.id === professionalId 
                ? { ...p, gallery: [...p.gallery, imageUrl] }
                : p
            ))
            alert('Foto adicionada à galeria do profissional!')
          }
        } else if (type === 'profile') {
          // Trocar foto de perfil do profissional
          const professionalId = e.currentTarget.id?.replace('profile-upload-', '')
          if (professionalId) {
            // Por enquanto, apenas atualizar o estado local
            setProfessionals(professionals.map(p => 
              p.id === professionalId 
                ? { ...p, profileImage: imageUrl }
                : p
            ))
            alert('Foto de perfil atualizada!')
          }
        }
      } catch (error) {
        console.error('Erro detalhado no upload:', error)
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        alert(`Erro ao fazer upload da imagem: ${errorMessage}`)
      }
    }
  }

  const deleteHomePhoto = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta foto?')) {
      try {
        // Por enquanto, apenas remover do estado local
        setHomeGallery(homeGallery.filter(photo => photo.id !== id))
        alert('Foto removida com sucesso!')
      } catch (error) {
        console.error('Erro ao deletar foto:', error)
        alert('Erro ao deletar foto')
      }
    }
  }

  const editHomePhoto = async (id: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        const file = target.files[0]
        try {
          const imageUrl = await uploadImage(file, 'home-gallery')
          
          // Por enquanto, apenas atualizar o estado local
          setHomeGallery(homeGallery.map(photo => 
            photo.id === id ? { ...photo, imageUrl } : photo
          ))
          alert('Foto atualizada com sucesso!')
        } catch (error) {
          console.error('Erro ao atualizar foto:', error)
          alert('Erro ao atualizar foto')
        }
      }
    }
    input.click()
  }

  const saveChanges = async () => {
    try {
      // Salvar ordem da galeria usando nossa API
      const response = await fetch('/api/home-gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photos: homeGallery })
      })

      if (response.ok) {
        alert('Alterações salvas com sucesso!')
      } else {
        console.error('Erro ao salvar alterações')
        alert('Erro ao salvar alterações')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar alterações')
    }
  }

  const deleteProfessional = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta profissional?')) {
      try {
        setProfessionals(professionals.filter(p => p.id !== id))
        alert('Profissional removida com sucesso!')
      } catch (error) {
        console.error('Erro ao deletar profissional:', error)
        alert('Erro ao deletar profissional')
      }
    }
  }

  const addProfessional = async () => {
    try {
      const newProfessional: Professional = {
        id: Date.now().toString(),
        name: 'Nova Profissional',
        title: 'Cargo',
        profileImage: '',
        gallery: [],
        description: 'Descrição',
        services: []
      }
      setProfessionals([...professionals, newProfessional])
      alert('Profissional adicionada com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error)
      alert('Erro ao adicionar profissional')
    }
  }

  // Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem === targetId) return

    const draggedIndex = homeGallery.findIndex(item => item.id === draggedItem)
    const targetIndex = homeGallery.findIndex(item => item.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newGallery = [...homeGallery]
    const [draggedItemData] = newGallery.splice(draggedIndex, 1)
    newGallery.splice(targetIndex, 0, draggedItemData)

    setHomeGallery(newGallery)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D15556] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Site</h1>
          <p className="text-gray-600 mt-2">Gerencie o conteúdo do seu site</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('home-gallery')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'home-gallery'
                  ? 'border-[#D15556] text-[#D15556]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Image className="w-4 h-4 inline mr-2" />
              Galeria da Home
            </button>
            <button
              onClick={() => setActiveTab('professionals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'professionals'
                  ? 'border-[#D15556] text-[#D15556]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profissionais
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-[#D15556] text-[#D15556]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Configurações
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Galeria da Home */}
          {activeTab === 'home-gallery' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Galeria da Home</h2>
                <button
                  onClick={() => document.getElementById('home-gallery-upload')?.click()}
                  className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Foto
                </button>
                <input
                  id="home-gallery-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'home-gallery')}
                  className="hidden"
                />
              </div>

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <Move className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Dica:</span>
                  <span className="text-sm ml-1">Arraste as fotos para reordenar a sequência do slide</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeGallery.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      draggedItem === item.id ? 'opacity-50 scale-95' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="relative">
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium z-10">
                        Posição {index + 1}
                      </div>
                      <img
                        src={item.imageUrl}
                        alt="Foto do slide"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => editHomePhoto(item.id)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4 inline mr-1" />
                        Editar
                      </button>
                      <button 
                        onClick={() => deleteHomePhoto(item.id)}
                        className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profissionais */}
          {activeTab === 'professionals' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profissionais</h2>
                <button
                  onClick={addProfessional}
                  className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Profissional
                </button>
              </div>

              <div className="space-y-6">
                {professionals.map((professional) => (
                  <div key={professional.id} className="border rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={professional.profileImage || '/placeholder-profile.jpg'}
                          alt={professional.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => document.getElementById(`profile-upload-${professional.id}`)?.click()}
                          className="mt-2 w-full bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors text-sm"
                        >
                          <Upload className="w-3 h-3 inline mr-1" />
                          Trocar Foto
                        </button>
                        <input
                          id={`profile-upload-${professional.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'profile')}
                          className="hidden"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nome
                            </label>
                            <input
                              type="text"
                              defaultValue={professional.name}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D15556] focus:border-[#D15556]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Título/Cargo
                            </label>
                            <input
                              type="text"
                              defaultValue={professional.title}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D15556] focus:border-[#D15556]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                          </label>
                          <textarea
                            defaultValue={professional.description}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D15556] focus:border-[#D15556]"
                            rows={3}
                          />
                        </div>

                        <div className="flex space-x-2">
                          <button className="bg-[#D15556] text-white px-4 py-2 rounded-md hover:bg-[#c04546] transition-colors">
                            <Save className="w-4 h-4 inline mr-1" />
                            Salvar
                          </button>
                          <button
                            onClick={() => deleteProfessional(professional.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configurações */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações Gerais</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Site
                  </label>
                  <input
                    type="text"
                    defaultValue="Espaço Guapa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D15556] focus:border-[#D15556]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Site
                  </label>
                  <textarea
                    defaultValue="Salão especializado em cabelos naturais"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D15556] focus:border-[#D15556]"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    defaultValue="Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D15556] focus:border-[#D15556]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    defaultValue="(19) 99153-1394"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D15556] focus:border-[#D15556]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="contato@espacoguapa.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D15556] focus:border-[#D15556]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveChanges}
            className="bg-[#D15556] text-white px-6 py-3 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Todas as Alterações
          </button>
        </div>
      </div>
    </div>
  )
}
