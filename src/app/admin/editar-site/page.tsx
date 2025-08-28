'use client'

import { useState, useEffect } from 'react'
import { localDB, HomePhoto, Professional, SiteSettings } from '@/lib/localStorage'

export default function EditarSite() {
  const [homeGallery, setHomeGallery] = useState<HomePhoto[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Guapa',
    description: 'Salão de beleza',
    address: '',
    whatsapp: '',
    email: '',
    updatedAt: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)

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
        loadSiteSettings()
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
      const photos = await response.json()
      console.log('Fotos carregadas:', photos.length)
      setHomeGallery(photos.filter(photo => photo.isActive).sort((a, b) => a.order - b.order))
    } catch (error) {
      console.error('Erro ao carregar galeria da home:', error)
      // Fallback para localStorage se a API falhar
      try {
        const photos = await localDB.getHomePhotos()
        setHomeGallery(photos.filter(photo => photo.isActive).sort((a, b) => a.order - b.order))
      } catch (localError) {
        console.error('Erro no fallback localStorage:', localError)
      }
    }
  }

  const loadProfessionals = async () => {
    try {
      const profs = await localDB.getProfessionals()
      setProfessionals(profs.filter(p => p.isActive))
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
    }
  }

  const loadSiteSettings = async () => {
    try {
      const settings = await localDB.getSiteSettings()
      setSiteSettings(settings)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const handleImageUpload = async (file: File, type: 'home-gallery' | 'professional-gallery') => {
    try {
      console.log('=== INÍCIO DO UPLOAD ===')
      console.log('Arquivo:', file.name, 'tamanho:', file.size, 'tipo:', file.type)
      console.log('Tipo de upload:', type)
      
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem')
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('O arquivo deve ter no máximo 5MB')
      }

      console.log('Validações passaram, convertendo para base64...')
      
      // Converter para base64
      const imageUrl = await convertToBase64(file)
      console.log('Imagem convertida para base64 com sucesso')
      console.log('Tamanho do base64:', imageUrl.length, 'caracteres')

      // Verificar se o base64 não é muito grande (limite de 1MB para base64)
      if (imageUrl.length > 1000000) {
        throw new Error('A imagem é muito grande. Use uma imagem menor.')
      }

      if (type === 'home-gallery') {
        console.log('Salvando foto no banco de dados...')
        
        // Salvar no banco de dados via API
        const response = await fetch('/api/home-gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Resposta da API:', response.status, errorText)
          throw new Error(`Erro ao salvar foto no banco de dados: ${response.status} - ${errorText}`)
        }
        
        const newPhoto = await response.json()
        console.log('Foto adicionada com sucesso:', newPhoto)
        await loadHomeGallery()
        alert('Foto adicionada com sucesso no banco de dados!')
      } else if (type === 'professional-gallery') {
        // Implementar para galeria de profissionais
        alert('Funcionalidade de galeria de profissionais em desenvolvimento')
      }
      
      console.log('=== FIM DO UPLOAD ===')
    } catch (error) {
      console.error('=== ERRO NO UPLOAD ===')
      console.error('Erro detalhado:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao fazer upload da imagem: ${errorMessage}`)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        console.log('Base64 gerado:', base64.substring(0, 100) + '...')
        console.log('Tamanho do base64:', base64.length)
        console.log('Formato do base64:', base64.startsWith('data:image/') ? 'Válido' : 'Inválido')
        
        // Validar se o base64 está correto
        if (!base64.startsWith('data:image/')) {
          reject(new Error('Formato de imagem inválido'))
          return
        }
        
        resolve(base64)
      }
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'))
      }
      reader.readAsDataURL(file)
    })
  }

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
          id: item.id,
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

  const saveSiteSettings = async () => {
    try {
      await localDB.updateSiteSettings(siteSettings)
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    }
  }

  const exportData = async () => {
    try {
      const data = await localDB.exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `guapa-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      alert('Dados exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      alert('Erro ao exportar dados')
    }
  }

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      await localDB.importData(text)
      await loadData()
      alert('Dados importados com sucesso!')
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      alert('Erro ao importar dados')
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Editar Site</h1>

        {/* Backup/Restore */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Backup e Restore</h2>
          <div className="flex gap-4">
            <button
              onClick={exportData}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Exportar Dados
            </button>
            <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
              Importar Dados
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Galeria da Home */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Galeria da Home</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar Nova Foto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, 'home-gallery')
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            {/* Botão de teste */}
            <button
              onClick={() => {
                console.log('=== TESTE MANUAL ===')
                console.log('localStorage disponível:', typeof localStorage !== 'undefined')
                console.log('localDB disponível:', typeof localDB !== 'undefined')
                
                // Teste com uma imagem base64 simples
                const testImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0icmVkIi8+PHRleHQgeD0iNTAiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0id2hpdGUiPkdBVU5BPC90ZXh0Pjwvc3ZnPg=='
                
                localDB.addHomePhoto(testImage)
                  .then(photo => {
                    console.log('Teste bem-sucedido:', photo)
                    alert('Teste de upload bem-sucedido!')
                    loadHomeGallery()
                  })
                  .catch(error => {
                    console.error('Teste falhou:', error)
                    alert('Teste de upload falhou: ' + error.message)
                  })
              }}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              🧪 Testar Upload
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homeGallery.map((photo, index) => (
              <div
                key={photo.id}
                className="relative group border rounded-lg overflow-hidden"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString())
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
                  const destIndex = index
                  if (sourceIndex !== destIndex) {
                    const items = Array.from(homeGallery)
                    const [reorderedItem] = items.splice(sourceIndex, 1)
                    items.splice(destIndex, 0, reorderedItem)
                    setHomeGallery(items)
                  }
                }}
              >
                <img
                  src={photo.imageUrl}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-48 object-cover"
                  onLoad={() => console.log('Imagem carregada com sucesso:', photo.id)}
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', photo.id, e)
                    console.error('URL da imagem:', photo.imageUrl.substring(0, 100) + '...')
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => deleteHomePhoto(photo.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    Excluir
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {photo.order}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configurações do Site */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Configurações do Site</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Site
              </label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={siteSettings.description}
                onChange={(e) => setSiteSettings({...siteSettings, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={siteSettings.address}
                onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                value={siteSettings.whatsapp}
                onChange={(e) => setSiteSettings({...siteSettings, whatsapp: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={siteSettings.email}
                onChange={(e) => setSiteSettings({...siteSettings, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={saveSiteSettings}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Salvar Configurações
          </button>
        </div>

        {/* Profissionais */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Profissionais</h2>
          <p className="text-gray-600 mb-4">Funcionalidade em desenvolvimento...</p>
        </div>
      </div>
    </div>
  )
}
