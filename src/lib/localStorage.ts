// Sistema de armazenamento local para funcionar como banco de dados

export interface HomePhoto {
  id: string
  imageUrl: string
  order: number
  isActive: boolean
  createdAt: string
}

export interface Professional {
  id: string
  name: string
  title: string
  profilePhoto: string
  description: string
  services: string[]
  gallery: string[]
  isActive: boolean
  createdAt: string
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string
  address: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  isPendingSync?: boolean // Novo campo para sincronização
}

export interface SiteSettings {
  siteName: string
  description: string
  address: string
  whatsapp: string
  email: string
  updatedAt: string
}

class LocalStorageDB {
  private getStorageKey(key: string): string {
    return `guapa_${key}`
  }

  // Home Gallery
  async getHomePhotos(): Promise<HomePhoto[]> {
    try {
      const photos = localStorage.getItem(this.getStorageKey('home_photos'))
      return photos ? JSON.parse(photos) : []
    } catch (error) {
      console.error('Erro ao buscar fotos da home:', error)
      return []
    }
  }

  async addHomePhoto(imageUrl: string): Promise<HomePhoto> {
    try {
      const photos = await this.getHomePhotos()
      const newPhoto: HomePhoto = {
        id: this.generateId(),
        imageUrl,
        order: photos.length + 1,
        isActive: true,
        createdAt: new Date().toISOString()
      }
      
      photos.push(newPhoto)
      localStorage.setItem(this.getStorageKey('home_photos'), JSON.stringify(photos))
      return newPhoto
    } catch (error) {
      console.error('Erro ao adicionar foto:', error)
      throw error
    }
  }

  async updateHomePhotoOrder(photos: HomePhoto[]): Promise<void> {
    try {
      const updatedPhotos = photos.map((photo, index) => ({
        ...photo,
        order: index + 1
      }))
      localStorage.setItem(this.getStorageKey('home_photos'), JSON.stringify(updatedPhotos))
    } catch (error) {
      console.error('Erro ao atualizar ordem das fotos:', error)
      throw error
    }
  }

  async deleteHomePhoto(id: string): Promise<void> {
    try {
      const photos = await this.getHomePhotos()
      const updatedPhotos = photos.filter(photo => photo.id !== id)
      localStorage.setItem(this.getStorageKey('home_photos'), JSON.stringify(updatedPhotos))
    } catch (error) {
      console.error('Erro ao deletar foto:', error)
      throw error
    }
  }

  // Professionals
  async getProfessionals(): Promise<Professional[]> {
    try {
      const professionals = localStorage.getItem(this.getStorageKey('professionals'))
      return professionals ? JSON.parse(professionals) : []
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
      return []
    }
  }

  async addProfessional(professional: Omit<Professional, 'id' | 'createdAt'>): Promise<Professional> {
    try {
      const professionals = await this.getProfessionals()
      const newProfessional: Professional = {
        ...professional,
        id: this.generateId(),
        createdAt: new Date().toISOString()
      }
      
      professionals.push(newProfessional)
      localStorage.setItem(this.getStorageKey('professionals'), JSON.stringify(professionals))
      return newProfessional
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error)
      throw error
    }
  }

  async updateProfessional(id: string, updates: Partial<Professional>): Promise<Professional> {
    try {
      const professionals = await this.getProfessionals()
      const index = professionals.findIndex(p => p.id === id)
      
      if (index === -1) {
        throw new Error('Profissional não encontrado')
      }
      
      professionals[index] = { ...professionals[index], ...updates }
      localStorage.setItem(this.getStorageKey('professionals'), JSON.stringify(professionals))
      return professionals[index]
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      throw error
    }
  }

  async deleteProfessional(id: string): Promise<void> {
    try {
      const professionals = await this.getProfessionals()
      const updatedProfessionals = professionals.filter(p => p.id !== id)
      localStorage.setItem(this.getStorageKey('professionals'), JSON.stringify(updatedProfessionals))
    } catch (error) {
      console.error('Erro ao deletar profissional:', error)
      throw error
    }
  }

  // Clients
  async getClients(): Promise<Client[]> {
    try {
      const clients = localStorage.getItem(this.getStorageKey('clients'))
      return clients ? JSON.parse(clients) : []
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return []
    }
  }

  async addClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    try {
      const clients = await this.getClients()
      const newClient: Client = {
        ...client,
        id: this.generateId(),
        createdAt: new Date().toISOString()
      }
      
      clients.push(newClient)
      localStorage.setItem(this.getStorageKey('clients'), JSON.stringify(clients))
      return newClient
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      throw error
    }
  }

  // Método para clientes enviarem seus dados para o admin
  async submitClientData(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'isPendingSync'>): Promise<Client> {
    const newClient: Client = {
      ...clientData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPendingSync: true
    }

    // Salvar no localStorage do cliente
    const clients = await this.getClients()
    clients.push(newClient)
    localStorage.setItem(this.getStorageKey('clients'), JSON.stringify(clients))

    // Tentar enviar para o admin (se estiver online)
    try {
      await this.syncToAdmin(newClient)
    } catch (error) {
      console.log('Cliente salvo localmente. Será sincronizado quando possível.')
    }

    return newClient
  }

  // Método para sincronizar dados com o admin
  async syncToAdmin(client: Client): Promise<void> {
    try {
      const response = await fetch('/api/clients/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      })

      if (response.ok) {
        // Marcar como sincronizado
        const clients = await this.getClients()
        const updatedClients = clients.map(c => 
          c.id === client.id ? { ...c, isPendingSync: false } : c
        )
        localStorage.setItem(this.getStorageKey('clients'), JSON.stringify(updatedClients))
        console.log('Cliente sincronizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
      throw error
    }
  }

  // Método para admin receber dados de clientes
  async receiveClientData(clientData: Client): Promise<void> {
    const clients = await this.getClients()
    
    // Verificar se já existe
    const existingIndex = clients.findIndex(c => c.id === clientData.id)
    
    if (existingIndex >= 0) {
      // Atualizar cliente existente
      clients[existingIndex] = { ...clientData, isPendingSync: false }
    } else {
      // Adicionar novo cliente
      clients.push({ ...clientData, isPendingSync: false })
    }

    localStorage.setItem(this.getStorageKey('clients'), JSON.stringify(clients))
  }

  // Método para sincronizar todos os dados pendentes
  async syncAllPending(): Promise<void> {
    const clients = await this.getClients()
    const pendingClients = clients.filter(c => c.isPendingSync)

    for (const client of pendingClients) {
      try {
        await this.syncToAdmin(client)
      } catch (error) {
        console.error(`Erro ao sincronizar cliente ${client.id}:`, error)
      }
    }
  }

  // Método para verificar se há dados pendentes
  async hasPendingData(): Promise<boolean> {
    const clients = await this.getClients()
    return clients.some(c => c.isPendingSync)
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const settings = localStorage.getItem(this.getStorageKey('site_settings'))
      return settings ? JSON.parse(settings) : {
        siteName: 'Guapa',
        description: 'Salão de beleza',
        address: '',
        whatsapp: '',
        email: '',
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      return {
        siteName: 'Guapa',
        description: 'Salão de beleza',
        address: '',
        whatsapp: '',
        email: '',
        updatedAt: new Date().toISOString()
      }
    }
  }

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    try {
      const currentSettings = await this.getSiteSettings()
      const updatedSettings: SiteSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem(this.getStorageKey('site_settings'), JSON.stringify(updatedSettings))
      return updatedSettings
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      throw error
    }
  }

  // Export/Import data
  async exportData(): Promise<string> {
    try {
      const data = {
        homePhotos: await this.getHomePhotos(),
        professionals: await this.getProfessionals(),
        clients: await this.getClients(),
        siteSettings: await this.getSiteSettings(),
        exportedAt: new Date().toISOString()
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      throw error
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.homePhotos) {
        localStorage.setItem(this.getStorageKey('home_photos'), JSON.stringify(data.homePhotos))
      }
      if (data.professionals) {
        localStorage.setItem(this.getStorageKey('professionals'), JSON.stringify(data.professionals))
      }
      if (data.clients) {
        localStorage.setItem(this.getStorageKey('clients'), JSON.stringify(data.clients))
      }
      if (data.siteSettings) {
        localStorage.setItem(this.getStorageKey('site_settings'), JSON.stringify(data.siteSettings))
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      throw error
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.getStorageKey('home_photos'))
      localStorage.removeItem(this.getStorageKey('professionals'))
      localStorage.removeItem(this.getStorageKey('clients'))
      localStorage.removeItem(this.getStorageKey('site_settings'))
    } catch (error) {
      console.error('Erro ao limpar dados:', error)
      throw error
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const localDB = new LocalStorageDB()
