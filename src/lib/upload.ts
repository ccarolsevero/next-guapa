import { supabase } from './supabase'

export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    console.log('Iniciando upload da imagem:', file.name, 'para pasta:', folder)
    
    // Verificar se o arquivo é uma imagem
    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo deve ser uma imagem')
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('O arquivo deve ter no máximo 5MB')
    }

    // Por enquanto, vamos usar base64 como método principal
    // já que o bucket do Supabase Storage não está configurado
    console.log('Convertendo imagem para base64...')
    return await convertToBase64(file)
    
  } catch (error) {
    console.error('Erro no upload:', error)
    throw error
  }
}

// Função para converter imagem para base64
async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      console.log('Imagem convertida para base64 com sucesso')
      resolve(base64)
    }
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'))
    }
    reader.readAsDataURL(file)
  })
}

export async function deleteImage(filePath: string): Promise<void> {
  try {
    // Se for uma URL base64, não precisa deletar
    if (filePath.startsWith('data:')) {
      console.log('Arquivo base64, pulando deleção')
      return
    }

    // Se for uma URL do Supabase, tentar deletar
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) {
      console.error('Erro ao deletar imagem:', error)
      throw error
    }
    
    console.log('Imagem deletada com sucesso')
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    throw error
  }
}
