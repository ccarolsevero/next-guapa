'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, X, Upload, Package } from 'lucide-react'

// Mock data para categorias
const categories = [
  { id: '1', name: 'Shampoos', description: 'Produtos para limpeza capilar', isActive: true },
  { id: '2', name: 'Condicionadores', description: 'Produtos para finalização', isActive: true },
  { id: '3', name: 'Máscaras', description: 'Tratamentos profundos', isActive: true },
  { id: '4', name: 'Cremes de Tratamento', description: 'Produtos para manutenção', isActive: true },
  { id: '5', name: 'Maquiagem', description: 'Produtos de beleza', isActive: true },
  { id: '6', name: 'Acessórios', description: 'Ferramentas e acessórios', isActive: true },
]

export default function NovoProdutoPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    categoryId: '',
    stock: '',
    isActive: true
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!formData.price) {
      newErrors.price = 'Preço é obrigatório'
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero'
    }

    if (formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price)) {
      newErrors.salePrice = 'Preço de promoção deve ser menor que o preço normal'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória'
    }

    if (!formData.stock) {
      newErrors.stock = 'Estoque é obrigatório'
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = 'Estoque não pode ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }



  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    // Resetar o input file
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageFile(file)
    }
  }

  const handleImageFile = (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.')
      return
    }
    
    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    setSelectedImage(file)
    
    // Criar preview da imagem
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simular criação do produto - em produção, seria uma chamada para a API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirecionar de volta para a lista de produtos
      window.location.href = '/admin/produtos'
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      setErrors({ submit: 'Erro ao criar produto. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin/produtos"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Informações do Produto</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome do Produto */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                  placeholder="Digite o nome do produto"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                    errors.categoryId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              {/* Preço */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                  placeholder="0,00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Preço de Promoção */}
              <div>
                <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Preço de Promoção (R$)
                </label>
                <input
                  type="number"
                  id="salePrice"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                    errors.salePrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                  placeholder="Deixe em branco se não houver promoção"
                />
                {errors.salePrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.salePrice}</p>
                )}
              </div>

              {/* Estoque */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Estoque *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Produto ativo
                </label>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{ color: '#000000' }}
                placeholder="Descreva o produto detalhadamente..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Imagem do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem do Produto
              </label>
              
              {imagePreview ? (
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Imagem selecionada</h3>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview do produto"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                        {selectedImage?.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedImage?.name} ({(selectedImage?.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              ) : (
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-pink-400 bg-pink-50' 
                      : 'border-gray-300 hover:border-pink-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Package className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-pink-400' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-600 mb-2">
                    {isDragging ? 'Solte a imagem aqui' : 'Arraste uma imagem aqui ou clique para selecionar'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Formatos aceitos: JPG, PNG, GIF (máximo 5MB)
                  </p>
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Imagem
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/produtos"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
