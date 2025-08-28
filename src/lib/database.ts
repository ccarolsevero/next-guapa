import { PrismaClient } from '@prisma/client'

// Configuração do cliente Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Funções auxiliares para o banco de dados
export class DatabaseService {
  // Home Gallery
  static async getHomePhotos() {
    try {
      return await prisma.homeGallery.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
      })
    } catch (error) {
      console.error('Erro ao buscar fotos da home:', error)
      throw error
    }
  }

  static async addHomePhoto(imageUrl: string) {
    try {
      // Pegar a maior ordem atual
      const maxOrder = await prisma.homeGallery.aggregate({
        _max: { order: true }
      })
      
      const newOrder = (maxOrder._max.order || 0) + 1

      return await prisma.homeGallery.create({
        data: {
          imageUrl,
          order: newOrder,
          isActive: true
        }
      })
    } catch (error) {
      console.error('Erro ao adicionar foto:', error)
      throw error
    }
  }

  static async updateHomePhotoOrder(photos: { id: string; order: number }[]) {
    try {
      for (const photo of photos) {
        await prisma.homeGallery.update({
          where: { id: photo.id },
          data: { order: photo.order }
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar ordem das fotos:', error)
      throw error
    }
  }

  static async deleteHomePhoto(id: string) {
    try {
      return await prisma.homeGallery.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Erro ao deletar foto:', error)
      throw error
    }
  }

  // Professionals
  static async getProfessionals() {
    try {
      return await prisma.professional.findMany({
        where: { isActive: true },
        include: {
          gallery: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
      throw error
    }
  }

  static async addProfessional(data: {
    name: string
    title?: string
    email?: string
    phone?: string
    bio?: string
    specialties?: string
    imageUrl?: string
  }) {
    try {
      return await prisma.professional.create({
        data: {
          ...data,
          isActive: true
        }
      })
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error)
      throw error
    }
  }

  static async updateProfessional(id: string, data: any) {
    try {
      return await prisma.professional.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      throw error
    }
  }

  static async deleteProfessional(id: string) {
    try {
      return await prisma.professional.update({
        where: { id },
        data: { isActive: false }
      })
    } catch (error) {
      console.error('Erro ao deletar profissional:', error)
      throw error
    }
  }

  // Clients
  static async getClients() {
    try {
      return await prisma.client.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      throw error
    }
  }

  static async addClient(data: {
    name: string
    email?: string
    phone: string
    address?: string
    notes?: string
  }) {
    try {
      return await prisma.client.create({
        data
      })
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      throw error
    }
  }

  static async updateClient(id: string, data: any) {
    try {
      return await prisma.client.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }
  }

  static async deleteClient(id: string) {
    try {
      return await prisma.client.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      throw error
    }
  }

  // Site Settings
  static async getSiteSettings() {
    try {
      let settings = await prisma.siteSettings.findFirst()
      
      if (!settings) {
        // Criar configurações padrão se não existirem
        settings = await prisma.siteSettings.create({
          data: {
            siteName: 'Espaço Guapa',
            description: 'Salão de beleza especializado em cabelos naturais',
            address: '',
            whatsapp: '',
            email: ''
          }
        })
      }
      
      return settings
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      throw error
    }
  }

  static async updateSiteSettings(data: any) {
    try {
      let settings = await prisma.siteSettings.findFirst()
      
      if (settings) {
        return await prisma.siteSettings.update({
          where: { id: settings.id },
          data
        })
      } else {
        return await prisma.siteSettings.create({
          data: {
            siteName: 'Espaço Guapa',
            description: 'Salão de beleza especializado em cabelos naturais',
            ...data
          }
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      throw error
    }
  }
}
