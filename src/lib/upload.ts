import { supabase } from './supabase'

export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) {
      throw error
    }

    // Retorna a URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Erro no upload:', error)
    throw error
  }
}

export async function deleteImage(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    throw error
  }
}
