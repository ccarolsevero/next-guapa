'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Search, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  Image,
  Phone,
  Mail,
  X
} from 'lucide-react'

interface HomePhoto {
  _id: string
  imageUrl: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Service {
  _id: string
  name: string
  category: string
  description: string
  price: number
  isActive: boolean
  order: number
  isFeatured: boolean
}

interface Professional {
  _id: string
  name: string
  title: string
  email: string
  phone: string
  shortDescription: string
  fullDescription: string
  services: string[]
  featuredServices: string[] // Serviços em destaque para aparecer na home
  profileImage: string
  gallery: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  newService?: string
  newGalleryImage?: string
}

interface SiteSettings {
  siteName: string
  description: string
  address: string
  whatsapp: string
  email: string
  updatedAt: string
}

interface Promotion {
  _id: string
  title: string
  description: string
  imageUrl: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function EditarSite() {
  const [homeGallery, setHomeGallery] = useState<HomePhoto[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [newImageUrl, setNewImageUrl] = useState<string>('')
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Guapa',
    description: 'Salão de beleza',
    address: '',
    whatsapp: '',
    email: '',
    updatedAt: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)
  const [showAddProfessionalModal, setShowAddProfessionalModal] = useState(false)
  const [showEditProfessionalModal, setShowEditProfessionalModal] = useState(false)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [showAddPromotionModal, setShowAddPromotionModal] = useState(false)
  const [showEditPromotionModal, setShowEditPromotionModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [isEditingFeaturedServices, setIsEditingFeaturedServices] = useState(false)
  const [newProfessional, setNewProfessional] = useState({
    name: '',
    title: 'Cabeleireira',
    email: '',
    phone: '',
    shortDescription: '',
    fullDescription: '',
    services: [] as string[],
    featuredServices: [] as string[], // Serviços em destaque para aparecer na home
    profileImage: '/assents/fotobruna.jpeg',
    gallery: [] as string[],
    newService: '',
    newGalleryImage: ''
  })
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    description: '',
    imageUrl: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Teste do localStorage
      console.log('=== TESTE LOCALSTORAGE ===')
      try {
        const testKey = 'guapa_test'
        localStorage.setItem(testKey, 'teste')
        const testValue = localStorage.getItem(testKey)
        console.log('Teste localStorage:', testValue)
        localStorage.removeItem(testKey)
      } catch (error) {
        console.error('Erro no teste localStorage:', error)
      }
      
      await Promise.all([
        loadHomeGallery(),
        loadProfessionals(),
        loadPromotions(),
        loadSiteSettings(),
        loadAvailableServices()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadHomeGallery = async () => {
    try {
      console.log('Carregando fotos do banco de dados...')
      const response = await fetch('/api/home-gallery')
      if (!response.ok) {
        throw new Error('Erro ao carregar fotos')
      }
      const photos: HomePhoto[] = await response.json()
      console.log('Fotos carregadas:', photos.length)
      console.log('Detalhes das fotos:', photos.map(p => ({ id: p._id, url: p.imageUrl, order: p.order, active: p.isActive })))
      
      const filteredPhotos = photos.filter((photo: HomePhoto) => photo.isActive).sort((a: HomePhoto, b: HomePhoto) => a.order - b.order)
      console.log('Fotos filtradas e ordenadas:', filteredPhotos.length)
      setHomeGallery(filteredPhotos)
    } catch (error) {
      console.error('Erro ao carregar galeria da home:', error)
      setHomeGallery([])
    }
  }

  const loadProfessionals = async () => {
    try {
      console.log('Carregando profissionais do banco de dados...')
      const response = await fetch('/api/professionals')
      if (!response.ok) {
        throw new Error('Erro ao carregar profissionais')
      }
      const profs: Professional[] = await response.json()
      console.log('Profissionais carregados:', profs.length)
      console.log('Dados dos profissionais:', profs)
      setProfessionals(profs) // Removendo o filtro para mostrar todos
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
      setProfessionals([])
    }
  }

  const loadPromotions = async () => {
    try {
      console.log('Carregando promoções do banco de dados...')
      const response = await fetch('/api/promotions')
      if (!response.ok) {
        throw new Error('Erro ao carregar promoções')
      }
      const proms: Promotion[] = await response.json()
      console.log('Promoções carregadas:', proms.length)
      setPromotions(proms)
    } catch (error) {
      console.error('Erro ao carregar promoções:', error)
      setPromotions([])
    }
  }

  const loadSiteSettings = async () => {
    try {
      console.log('Carregando configurações do site...')
      const response = await fetch('/api/site-settings')
      if (!response.ok) {
        throw new Error('Erro ao carregar configurações')
      }
      const settings: SiteSettings = await response.json()
      console.log('Configurações carregadas')
      setSiteSettings(settings)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const loadAvailableServices = async () => {
    try {
      console.log('Carregando serviços disponíveis...')
      const response = await fetch('/api/services')
      if (!response.ok) {
        throw new Error('Erro ao carregar serviços')
      }
      const services: Service[] = await response.json()
      console.log('Serviços carregados:', services.length)
      setAvailableServices(services.filter(service => service.isActive))
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      setAvailableServices([])
    }
  }

  // Função de upload removida - não precisamos mais de base64

  // Função convertToBase64 removida - não precisamos mais

  const deleteHomePhoto = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta foto?')) {
      try {
        console.log('Tentando deletar foto do banco de dados:', id)
        
        const response = await fetch(`/api/home-gallery?id=${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Erro ao deletar foto do banco de dados')
        }
        
        console.log('Foto deletada com sucesso do banco de dados')
        await loadHomeGallery()
        alert('Foto removida com sucesso do banco de dados!')
      } catch (error) {
        console.error('Erro ao deletar foto:', error)
        alert('Erro ao deletar foto')
      }
    }
  }

  const handleAddImageByUrl = async () => {
    if (!newImageUrl.trim()) {
      alert('Por favor, insira uma URL válida')
      return
    }

    try {
      console.log('Adicionando foto por URL:', newImageUrl)
      
      const response = await fetch('/api/home-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: newImageUrl.trim(),
          isActive: true,
          order: homeGallery.length + 1
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao adicionar foto')
      }

      const result = await response.json()
      console.log('Resposta da API:', result)
      console.log('Foto adicionada com sucesso, ID:', result._id)
      console.log('URL salva:', result.imageUrl)
      
      setNewImageUrl('') // Limpa o campo
      await loadHomeGallery() // Recarrega a galeria
      alert('Foto adicionada com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar foto:', error)
      alert('Erro ao adicionar foto: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const clearAllHomePhotos = async () => {
    if (confirm('Tem certeza que deseja excluir TODAS as fotos da galeria da home? Esta ação não pode ser desfeita.')) {
      try {
        console.log('Limpando toda a galeria da home...')
        
        // Excluir todas as fotos uma por uma
        for (const photo of homeGallery) {
          await deleteHomePhoto(photo._id || (photo as any).id)
        }
        
        alert('Galeria da home limpa com sucesso!')
      } catch (error) {
        console.error('Erro ao limpar galeria:', error)
        alert('Erro ao limpar galeria')
      }
    }
  }

  const handleDragEnd = async (result: { destination?: { index: number }, source: { index: number } }) => {
    if (!result.destination) return

    const items = Array.from(homeGallery)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setHomeGallery(items)

    try {
      console.log('Atualizando ordem das fotos no banco de dados...')
      
      const response = await fetch('/api/home-gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items.map((item, index) => ({
          id: item._id,
          order: index + 1
        })))
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar ordem no banco de dados')
      }
      
      alert('Ordem das fotos atualizada com sucesso no banco de dados!')
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error)
      alert('Erro ao atualizar ordem das fotos')
    }
  }

  // Funções para gerenciar profissionais
  const handleToggleProfessionalActive = async (professional: Professional) => {
    try {
      const response = await fetch(`/api/professionals/${professional._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...professional,
          isActive: !professional.isActive
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar profissional')
      }

      await loadProfessionals()
      alert(`Profissional ${professional.isActive ? 'desativado' : 'ativado'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      alert('Erro ao atualizar profissional')
    }
  }

  const handleToggleProfessionalFeatured = async (professional: Professional) => {
    try {
      const response = await fetch(`/api/professionals/${professional._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...professional,
          isFeatured: !professional.isFeatured
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar profissional')
      }

      await loadProfessionals()
      alert(`Profissional ${professional.isFeatured ? 'removido dos' : 'adicionado aos'} destaques!`)
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      alert('Erro ao atualizar profissional')
    }
  }

  const handleEditProfessional = (professional: Professional) => {
    setSelectedProfessional(professional)
    setShowEditProfessionalModal(true)
  }

  const handleDeleteProfessional = async (professional: Professional) => {
    if (confirm(`Tem certeza que deseja excluir a profissional ${professional.name}?`)) {
      try {
        const response = await fetch(`/api/professionals/${professional._id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Erro ao deletar profissional')
        }

        await loadProfessionals()
        alert('Profissional deletado com sucesso!')
      } catch (error) {
        console.error('Erro ao deletar profissional:', error)
        alert('Erro ao deletar profissional')
      }
    }
  }

  const handleAddProfessional = async () => {
    try {
              const response = await fetch('/api/professionals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newProfessional.name,
            title: newProfessional.title,
            email: newProfessional.email,
            phone: newProfessional.phone,
            shortDescription: newProfessional.shortDescription,
            fullDescription: newProfessional.fullDescription,
            services: newProfessional.services,
            featuredServices: newProfessional.featuredServices,
            profileImage: newProfessional.profileImage,
            gallery: newProfessional.gallery
          })
        })

      if (!response.ok) {
        throw new Error('Erro ao adicionar profissional')
      }

      await loadProfessionals()
      setShowAddProfessionalModal(false)
      setNewProfessional({
        name: '',
        title: 'Cabeleireira',
        email: '',
        phone: '',
        shortDescription: '',
        fullDescription: '',
        services: [],
        featuredServices: [], // Resetado para novos profissionais
        profileImage: '/assents/fotobruna.jpeg',
        gallery: [],
        newService: '',
        newGalleryImage: ''
      })
      alert('Profissional adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error)
      alert('Erro ao adicionar profissional')
    }
  }

  // Funções para adicionar serviços e fotos
  const handleAddService = () => {
    console.log('Tentando adicionar serviço:', newProfessional.newService)
    if (newProfessional.newService.trim()) {
      const newService = newProfessional.newService.trim()
      console.log('Adicionando serviço:', newService)
      setNewProfessional({
        ...newProfessional,
        services: [...newProfessional.services, newService],
        newService: ''
      })
      console.log('Serviços após adicionar:', [...newProfessional.services, newService])
    }
  }

  const handleAddGalleryImage = () => {
    console.log('handleAddGalleryImage chamada')
    console.log('newProfessional:', newProfessional)
    console.log('newGalleryImage:', newProfessional.newGalleryImage)
    
    if (newProfessional.newGalleryImage?.trim()) {
      const newImage = newProfessional.newGalleryImage.trim()
      console.log('Adicionando foto:', newImage)
      setNewProfessional({
        ...newProfessional,
        gallery: [...newProfessional.gallery, newImage],
        newGalleryImage: ''
      })
      console.log('Galeria após adicionar:', [...newProfessional.gallery, newImage])
    } else {
      console.log('newGalleryImage está vazio ou undefined')
    }
  }

  const handleRemoveService = (index: number) => {
    console.log('Removendo serviço no índice:', index)
    setNewProfessional({
      ...newProfessional,
      services: newProfessional.services.filter((_, i) => i !== index)
    })
  }

  const handleRemoveGalleryImage = (index: number) => {
    console.log('Removendo foto no índice:', index)
    setNewProfessional({
      ...newProfessional,
      gallery: newProfessional.gallery.filter((_, i) => i !== index)
    })
  }

  // Funções para modal de serviços
  const openServicesModal = (professional: Professional) => {
    setSelectedProfessional(professional)
    // Converter IDs para nomes se necessário
    const serviceNames = professional.services.map(serviceId => {
      const service = availableServices.find(s => s._id === serviceId)
      return service ? service.name : serviceId
    })
    setSelectedServices(serviceNames)
    setShowServicesModal(true)
  }

  const openFeaturedServicesModal = (professional: Professional) => {
    setSelectedProfessional(professional)
    setIsEditingFeaturedServices(true)
    // Converter IDs para nomes se necessário
    const serviceNames = professional.featuredServices?.map(serviceId => {
      const service = availableServices.find(s => s._id === serviceId)
      return service ? service.name : serviceId
    }) || []
    setSelectedServices(serviceNames)
    setShowServicesModal(true)
  }

  const openFeaturedServicesModalForNew = () => {
    setSelectedProfessional(null)
    setIsEditingFeaturedServices(true)
    setSelectedServices(newProfessional.featuredServices || [])
    setShowServicesModal(true)
  }

  const handleServiceToggle = (serviceId: string) => {
    console.log('Toggle service:', serviceId)
    const service = availableServices.find(s => s._id === serviceId)
    if (!service) return
    
    setSelectedServices(prev => {
      const newServices = prev.includes(service.name) 
        ? prev.filter(name => name !== service.name)
        : [...prev, service.name]
      console.log('New selected services:', newServices)
      return newServices
    })
  }

  const handleSaveServices = async () => {
    console.log('Salvando serviços...')
    console.log('Selected professional:', selectedProfessional)
    console.log('Selected services:', selectedServices)
    console.log('Is editing featured services:', isEditingFeaturedServices)
    
    try {
      if (selectedProfessional) {
        // Editando profissional existente
        console.log('Editando profissional existente...')
        
        const updateData = isEditingFeaturedServices
          ? { ...selectedProfessional, featuredServices: selectedServices }
          : { ...selectedProfessional, services: selectedServices }
        
        console.log('Update data being sent:', updateData)
        console.log('Is editing featured services:', isEditingFeaturedServices)
        console.log('Selected services:', selectedServices)
        
        const response = await fetch(`/api/professionals/${selectedProfessional._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) {
          throw new Error('Erro ao salvar serviços')
        }

        const responseData = await response.json()
        console.log('API response:', responseData)
        console.log('Featured services in response:', responseData.featuredServices)

        await loadProfessionals()
        alert(`Serviços ${isEditingFeaturedServices ? 'em destaque ' : ''}salvos com sucesso!`)
      } else {
        // Criando novo profissional
        console.log('Atualizando novo profissional...')
        if (isEditingFeaturedServices) {
          setNewProfessional({
            ...newProfessional,
            featuredServices: selectedServices
          })
          alert('Serviços em destaque selecionados! Continue preenchendo os outros campos.')
        } else {
          setNewProfessional({
            ...newProfessional,
            services: selectedServices
          })
          alert('Serviços selecionados! Continue preenchendo os outros campos.')
        }
      }

      setShowServicesModal(false)
      setSelectedProfessional(null)
      setSelectedServices([])
      setIsEditingFeaturedServices(false)
    } catch (error) {
      console.error('Erro ao salvar serviços:', error)
      alert('Erro ao salvar serviços')
    }
  }

  // Funções para editar profissional
  const handleAddServiceToEdit = () => {
    if (selectedProfessional?.newService?.trim()) {
      const newService = selectedProfessional.newService.trim()
      setSelectedProfessional({
        ...selectedProfessional,
        services: [...selectedProfessional.services, newService],
        newService: ''
      })
    }
  }

  const handleAddGalleryImageToEdit = () => {
    console.log('handleAddGalleryImageToEdit chamada')
    console.log('selectedProfessional:', selectedProfessional)
    console.log('newGalleryImage:', selectedProfessional?.newGalleryImage)
    
    if (selectedProfessional?.newGalleryImage?.trim()) {
      const newImage = selectedProfessional.newGalleryImage.trim()
      console.log('Adicionando nova imagem:', newImage)
      setSelectedProfessional({
        ...selectedProfessional,
        gallery: [...selectedProfessional.gallery, newImage],
        newGalleryImage: ''
      })
      console.log('Galeria atualizada')
    } else {
      console.log('newGalleryImage está vazio ou undefined')
    }
  }

  const handleRemoveServiceFromEdit = (index: number) => {
    if (selectedProfessional) {
      setSelectedProfessional({
        ...selectedProfessional,
        services: selectedProfessional.services.filter((_, i) => i !== index)
      })
    }
  }

  const handleRemoveGalleryImageFromEdit = (index: number) => {
    if (selectedProfessional) {
      setSelectedProfessional({
        ...selectedProfessional,
        gallery: selectedProfessional.gallery.filter((_, i) => i !== index)
      })
    }
  }

  const handleSaveProfessionalEdit = async () => {
    if (!selectedProfessional) return

    try {
      const response = await fetch(`/api/professionals/${selectedProfessional._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedProfessional.name,
          title: selectedProfessional.title,
          email: selectedProfessional.email,
          phone: selectedProfessional.phone,
          shortDescription: selectedProfessional.shortDescription,
          fullDescription: selectedProfessional.fullDescription,
          services: selectedProfessional.services,
          featuredServices: selectedProfessional.featuredServices, // Adicionado para profissionais existentes
          profileImage: selectedProfessional.profileImage,
          gallery: selectedProfessional.gallery,
          isActive: selectedProfessional.isActive,
          isFeatured: selectedProfessional.isFeatured
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar profissional')
      }

      await loadProfessionals()
      setShowEditProfessionalModal(false)
      setSelectedProfessional(null)
      alert('Profissional atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      alert('Erro ao atualizar profissional')
    }
  }

  const saveSiteSettings = async () => {
    try {
      console.log('Salvando configurações do site...')
              const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteSettings)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }
      
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    }
  }

  // Funções para gerenciar promoções
  const handleAddPromotion = async () => {
    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPromotion.title,
          description: newPromotion.description,
          imageUrl: newPromotion.imageUrl
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao adicionar promoção')
      }

      await loadPromotions()
      setShowAddPromotionModal(false)
      setNewPromotion({
        title: '',
        description: '',
        imageUrl: ''
      })
      alert('Promoção adicionada com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar promoção:', error)
      alert('Erro ao adicionar promoção')
    }
  }

  const handleEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setShowEditPromotionModal(true)
  }

  const handleSavePromotionEdit = async () => {
    if (!selectedPromotion) return

    try {
      const response = await fetch(`/api/promotions/${selectedPromotion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedPromotion.title,
          description: selectedPromotion.description,
          imageUrl: selectedPromotion.imageUrl,
          isActive: selectedPromotion.isActive
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar promoção')
      }

      await loadPromotions()
      setShowEditPromotionModal(false)
      setSelectedPromotion(null)
      alert('Promoção atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar promoção:', error)
      alert('Erro ao atualizar promoção')
    }
  }

  const handleDeletePromotion = async (promotion: Promotion) => {
    if (confirm(`Tem certeza que deseja excluir a promoção "${promotion.title}"?`)) {
      try {
        const response = await fetch(`/api/promotions/${promotion._id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Erro ao deletar promoção')
        }

        await loadPromotions()
        alert('Promoção deletada com sucesso!')
      } catch (error) {
        console.error('Erro ao deletar promoção:', error)
        alert('Erro ao deletar promoção')
      }
    }
  }

  const handleTogglePromotionActive = async (promotion: Promotion) => {
    try {
      const response = await fetch(`/api/promotions/${promotion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...promotion,
          isActive: !promotion.isActive
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar promoção')
      }

      await loadPromotions()
      alert(`Promoção ${promotion.isActive ? 'desativada' : 'ativada'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao atualizar promoção:', error)
      alert('Erro ao atualizar promoção')
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredPermission="siteEdit" fallbackMessage="Você não tem permissão para editar o site. Apenas administradores podem fazer alterações no site.">
      <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Editar Site</h1>



        {/* Galeria da Home */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#d34d4c' }}>Galeria da Home</h2>
          
          <div className="mb-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Adicionar Nova Foto por URL
              </label>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              💡 <strong>Dica:</strong> Arraste e solte as fotos para reordená-las. A ordem será salva automaticamente.
            </p>
            
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <button
                onClick={() => handleAddImageByUrl()}
                disabled={!newImageUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homeGallery.map((photo, index) => (
              <div
                key={photo._id || (photo as any).id}
                className="relative group border border-gray-200 rounded-lg overflow-hidden cursor-move shadow-sm hover:shadow-md transition-all duration-200"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString())
                  e.currentTarget.classList.add('opacity-50', 'scale-95')
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove('opacity-50', 'scale-95')
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
                onDragLeave={(e) => {
                  // Sem bordas durante drag
                }}
                onDrop={async (e) => {
                  e.preventDefault()
                  
                  const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
                  const destIndex = index
                  
                  if (sourceIndex !== destIndex) {
                    try {
                      const items = Array.from(homeGallery)
                      const [reorderedItem] = items.splice(sourceIndex, 1)
                      items.splice(destIndex, 0, reorderedItem)
                      
                      // Atualizar estado local
                      setHomeGallery(items)
                      
                      // Atualizar ordem no banco de dados
                      const response = await fetch('/api/home-gallery', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(items.map((item, idx) => ({
                          id: item._id || (item as any).id,
                          order: idx + 1
                        })))
                      })
                      
                      if (!response.ok) {
                        throw new Error('Erro ao atualizar ordem')
                      }
                      
                      console.log('Ordem das fotos atualizada com sucesso!')
                    } catch (error) {
                      console.error('Erro ao atualizar ordem:', error)
                      alert('Erro ao atualizar ordem das fotos')
                      // Reverter mudanças em caso de erro
                      await loadHomeGallery()
                    }
                  }
                }}
              >
                <img
                  src={photo.imageUrl || '/assents/fotobruna.jpeg'}
                  alt={`Foto ${index + 1}`}
                  style={{ 
                    width: '100%',
                    height: '192px',
                    objectFit: 'cover'
                  }}
                  onLoad={() => {
                    console.log('✅ Imagem carregada com sucesso:', photo.imageUrl)
                  }}
                  onError={(e) => {
                    console.error('❌ Erro ao carregar imagem:', photo.imageUrl)
                    const target = e.target as HTMLImageElement
                    target.src = '/assents/fotobruna.jpeg'
                  }}
                />
                {/* Overlay de exclusão - temporariamente removido para debug */}
                {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => deleteHomePhoto(photo.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    Excluir
                  </button>
                </div> */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {photo.order}
                </div>
                <div className="absolute top-2 right-2 bg-blue-600 bg-opacity-80 text-white px-2 py-1 rounded text-xs">
                  🖱️ Arrastar
                </div>
                
                {/* Botão Excluir */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => deleteHomePhoto(photo._id || (photo as any).id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                    title="Excluir foto"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Profissionais */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold" style={{ color: '#d34d4c' }}>Profissionais</h2>
            <button
              onClick={() => setShowAddProfessionalModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Profissional
            </button>
          </div>

          {/* Lista de Profissionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <div key={professional._id} className={`border rounded-lg overflow-hidden ${!professional.isActive ? 'opacity-60 bg-gray-100' : ''}`}>
                {/* Imagem de Perfil */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={professional.profileImage}
                    alt={professional.name}
                    className={`w-full h-full object-cover ${!professional.isActive ? 'grayscale' : ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/assents/fotobruna.jpeg'
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleToggleProfessionalFeatured(professional)}
                      className={`p-2 rounded-full ${
                        professional.isFeatured 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-white text-gray-600'
                      } hover:bg-yellow-500 hover:text-white transition-colors`}
                      title={professional.isFeatured ? 'Remover dos destaques' : 'Adicionar aos destaques'}
                    >
                      {professional.isFeatured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleToggleProfessionalActive(professional)}
                      className={`p-2 rounded-full ${
                        professional.isActive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      } hover:opacity-80 transition-colors`}
                      title={professional.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {professional.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Indicador de status */}
                  {!professional.isActive && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      DESATIVADA
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`text-lg font-semibold ${!professional.isActive ? 'text-gray-500' : 'text-gray-800'}`}>
                        {professional.name}
                      </h3>
                      <p className={`text-sm ${!professional.isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                        {professional.title}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {professional.isFeatured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Destaque
                        </span>
                      )}
                      {!professional.isActive && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          Inativa
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`text-sm mb-3 line-clamp-2 ${!professional.isActive ? 'text-gray-400' : 'text-gray-700'}`}>
                    {professional.shortDescription}
                  </p>

                  {/* Serviços */}
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-800 mb-1">Serviços:</h4>
                    <div className="flex flex-wrap gap-1">
                      {professional.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {professional.services.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{professional.services.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Galeria */}
                  <div className="mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Image className="w-3 h-3 mr-1" />
                      {professional.gallery.length} fotos na galeria
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProfessional(professional)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-3 h-3 inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProfessional(professional)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {professionals.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Nenhum profissional cadastrado
              </h3>
              <p className="text-gray-500">
                Comece adicionando o primeiro profissional
              </p>
            </div>
          )}
        </div>

        {/* Promoções/Serviços */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ color: '#d34d4c' }}>Promoções/Serviços</h2>
            <button
              onClick={() => setShowAddPromotionModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Promoção
            </button>
          </div>

          {/* Lista de Promoções */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promotion) => (
              <div key={promotion._id} className={`border rounded-lg overflow-hidden ${!promotion.isActive ? 'opacity-60 bg-gray-100' : ''}`}>
                {/* Imagem */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={promotion.imageUrl}
                    alt={promotion.title}
                    className={`w-full h-full object-cover ${!promotion.isActive ? 'grayscale' : ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/assents/fotobruna.jpeg'
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleTogglePromotionActive(promotion)}
                      className={`p-2 rounded-full ${
                        promotion.isActive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      } hover:opacity-80 transition-colors`}
                      title={promotion.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {promotion.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Indicador de status */}
                  {!promotion.isActive && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      DESATIVADA
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`text-lg font-semibold ${!promotion.isActive ? 'text-gray-500' : 'text-gray-800'}`}>
                        {promotion.title}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      {!promotion.isActive && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          Inativa
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`text-sm mb-3 line-clamp-3 ${!promotion.isActive ? 'text-gray-400' : 'text-gray-700'}`}>
                    {promotion.description}
                  </p>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPromotion(promotion)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-3 h-3 inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promotion)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {promotions.length === 0 && (
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Nenhuma promoção cadastrada
              </h3>
              <p className="text-gray-500">
                Comece adicionando a primeira promoção
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Editar Profissional */}
      {showEditProfessionalModal && selectedProfessional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Editar Profissional</h3>
              <button 
                onClick={() => setShowEditProfessionalModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={selectedProfessional.name}
                    onChange={(e) => setSelectedProfessional({...selectedProfessional, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="Nome da profissional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Função
                  </label>
                  <input
                    type="text"
                    value={selectedProfessional.title}
                    onChange={(e) => setSelectedProfessional({...selectedProfessional, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="Ex: Cabeleireira"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedProfessional.email}
                    onChange={(e) => setSelectedProfessional({...selectedProfessional, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={selectedProfessional.phone}
                    onChange={(e) => setSelectedProfessional({...selectedProfessional, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="(19) 99999-9999"
                  />
                </div>
              </div>

              {/* Descrições */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Descrição para Home *
                </label>
                <textarea
                  value={selectedProfessional.shortDescription}
                  onChange={(e) => setSelectedProfessional({...selectedProfessional, shortDescription: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="Descrição curta que aparece na página inicial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Descrição Completa *
                </label>
                <textarea
                  value={selectedProfessional.fullDescription}
                  onChange={(e) => setSelectedProfessional({...selectedProfessional, fullDescription: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="Descrição completa que aparece na página da profissional"
                />
              </div>

              {/* Foto de Perfil */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  URL da Foto de Perfil
                </label>
                <input
                  type="url"
                  value={selectedProfessional.profileImage}
                  onChange={(e) => setSelectedProfessional({...selectedProfessional, profileImage: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>

              {/* Serviços */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Serviços Oferecidos
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      setIsEditingFeaturedServices(false)
                      openServicesModal(selectedProfessional)
                    }}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Selecionar Serviços
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProfessional.services.map((serviceName, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {serviceName}
                      <button
                        onClick={() => {
                          const newServices = selectedProfessional.services.filter((_, i) => i !== index)
                          setSelectedProfessional({...selectedProfessional, services: newServices})
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Serviços em Destaque */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Serviços em Destaque (para aparecer na home)
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => openFeaturedServicesModal(selectedProfessional)}
                    className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Selecionar Serviços em Destaque
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProfessional.featuredServices?.map((serviceName, index) => (
                    <span
                      key={index}
                      className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {serviceName}
                      <button
                        onClick={() => {
                          const newFeaturedServices = selectedProfessional.featuredServices?.filter((_, i) => i !== index) || []
                          setSelectedProfessional({...selectedProfessional, featuredServices: newFeaturedServices})
                        }}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  )) || (
                    <span className="text-gray-500 text-sm">Nenhum serviço em destaque selecionado</span>
                  )}
                </div>
              </div>

              {/* Galeria */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Galeria de Fotos (URLs)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={selectedProfessional.newGalleryImage || ''}
                    onChange={(e) => setSelectedProfessional({...selectedProfessional, newGalleryImage: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="https://exemplo.com/foto.jpg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && selectedProfessional.newGalleryImage?.trim()) {
                        handleAddGalleryImageToEdit()
                      }
                    }}
                  />
                  <button
                    onClick={handleAddGalleryImageToEdit}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedProfessional.gallery.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-contain rounded-lg bg-[#006D5B]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/assents/fotobruna.jpeg'
                        }}
                      />
                      <button
                        onClick={() => handleRemoveGalleryImageFromEdit(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditProfessionalModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfessionalEdit}
                  disabled={!selectedProfessional.name || !selectedProfessional.shortDescription || !selectedProfessional.fullDescription}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Profissional */}
      {showAddProfessionalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Adicionar Profissional</h3>
              <button 
                onClick={() => setShowAddProfessionalModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newProfessional.name}
                    onChange={(e) => setNewProfessional({...newProfessional, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="Nome da profissional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Função
                  </label>
                  <input
                    type="text"
                    value={newProfessional.title}
                    onChange={(e) => setNewProfessional({...newProfessional, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="Ex: Cabeleireira"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newProfessional.email}
                    onChange={(e) => setNewProfessional({...newProfessional, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={newProfessional.phone}
                    onChange={(e) => setNewProfessional({...newProfessional, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="(19) 99999-9999"
                  />
                </div>
              </div>

              {/* Descrições */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Descrição Curta (para Home) *
                </label>
                <input
                  type="text"
                  value={newProfessional.shortDescription}
                  onChange={(e) => setNewProfessional({...newProfessional, shortDescription: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="Breve descrição que aparece na home"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Descrição Completa (para página da profissional) *
                </label>
                <textarea
                  value={newProfessional.fullDescription}
                  onChange={(e) => setNewProfessional({...newProfessional, fullDescription: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  rows={4}
                  placeholder="Descrição detalhada sobre a profissional"
                />
              </div>

              {/* Imagem de Perfil */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  URL da Imagem de Perfil
                </label>
                <input
                  type="url"
                  value={newProfessional.profileImage}
                  onChange={(e) => setNewProfessional({...newProfessional, profileImage: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              {/* Serviços */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Serviços Oferecidos
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      setSelectedServices(newProfessional.services)
                      setIsEditingFeaturedServices(false)
                      setShowServicesModal(true)
                    }}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Selecionar Serviços
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newProfessional.services.map((serviceName, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {serviceName}
                      <button
                        onClick={() => {
                          const newServices = newProfessional.services.filter((_, i) => i !== index)
                          setNewProfessional({...newProfessional, services: newServices})
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Serviços em Destaque */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Serviços em Destaque (para aparecer na home)
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={openFeaturedServicesModalForNew}
                    className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Selecionar Serviços em Destaque
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newProfessional.featuredServices?.map((serviceName, index) => (
                    <span
                      key={index}
                      className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {serviceName}
                      <button
                        onClick={() => {
                          const newFeaturedServices = newProfessional.featuredServices?.filter((_, i) => i !== index) || []
                          setNewProfessional({...newProfessional, featuredServices: newFeaturedServices})
                        }}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  )) || (
                    <span className="text-gray-500 text-sm">Nenhum serviço em destaque selecionado</span>
                  )}
                </div>
              </div>

              {/* Galeria */}
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Galeria de Fotos (URLs)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={newProfessional.newGalleryImage}
                    onChange={(e) => setNewProfessional({...newProfessional, newGalleryImage: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                    placeholder="https://exemplo.com/foto.jpg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newProfessional.newGalleryImage.trim()) {
                        handleAddGalleryImage()
                      }
                    }}
                  />
                  <button
                    onClick={handleAddGalleryImage}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {newProfessional.gallery.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-contain rounded-lg bg-[#006D5B]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/assents/fotobruna.jpeg'
                        }}
                      />
                      <button
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddProfessionalModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddProfessional}
                  disabled={!newProfessional.name || !newProfessional.shortDescription || !newProfessional.fullDescription}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar Profissional
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Serviços */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#006D5B]">
                  {isEditingFeaturedServices ? 'Selecionar Serviços em Destaque' : 'Selecionar Serviços'}
                </h3>
                <button
                  onClick={() => {
                    setShowServicesModal(false)
                    setSelectedProfessional(null)
                    setSelectedServices([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableServices.map((service) => (
                  <div
                    key={service._id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedServices.includes(service._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.name)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleServiceToggle(service._id)
                        }}
                        className="mt-1 cursor-pointer"
                      />
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleServiceToggle(service._id)}
                      >
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <p className="text-sm font-medium text-[#D15556] mt-1">
                          R$ {service.price.toFixed(2)}
                        </p>
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mt-2">
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowServicesModal(false)
                    setSelectedProfessional(null)
                    setSelectedServices([])
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveServices}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium"
                >
                  {isEditingFeaturedServices ? 'Salvar Serviços em Destaque' : 'Salvar Serviços'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Promoção */}
      {showAddPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Adicionar Promoção</h3>
              <button 
                onClick={() => setShowAddPromotionModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newPromotion.title}
                  onChange={(e) => setNewPromotion({...newPromotion, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="Título da promoção"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Descrição *
                </label>
                <textarea
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  rows={4}
                  placeholder="Descrição da promoção"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  value={newPromotion.imageUrl}
                  onChange={(e) => setNewPromotion({...newPromotion, imageUrl: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              {/* Preview da imagem */}
              {newPromotion.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Preview da Imagem
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <img
                      src={newPromotion.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/assents/fotobruna.jpeg'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddPromotionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPromotion}
                  disabled={!newPromotion.title || !newPromotion.description || !newPromotion.imageUrl}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar Promoção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Promoção */}
      {showEditPromotionModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Editar Promoção</h3>
              <button 
                onClick={() => setShowEditPromotionModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={selectedPromotion.title}
                  onChange={(e) => setSelectedPromotion({...selectedPromotion, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="Título da promoção"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Descrição *
                </label>
                <textarea
                  value={selectedPromotion.description}
                  onChange={(e) => setSelectedPromotion({...selectedPromotion, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  rows={4}
                  placeholder="Descrição da promoção"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  value={selectedPromotion.imageUrl}
                  onChange={(e) => setSelectedPromotion({...selectedPromotion, imageUrl: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              {/* Preview da imagem */}
              {selectedPromotion.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-[#006D5B] mb-2">
                    Preview da Imagem
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <img
                      src={selectedPromotion.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/assents/fotobruna.jpeg'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPromotion.isActive}
                    onChange={(e) => setSelectedPromotion({...selectedPromotion, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-[#006D5B]">Promoção ativa</span>
                </label>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditPromotionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePromotionEdit}
                  disabled={!selectedPromotion.title || !selectedPromotion.description || !selectedPromotion.imageUrl}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
