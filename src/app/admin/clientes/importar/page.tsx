'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Users,
  Eye
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface ImportResult {
  total: number
  created: number
  updated: number
  errors: string[]
  details: Array<{
    action: 'created' | 'updated'
    email: string
    name: string
  }>
}

export default function ImportarClientesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<Array<{
    nome?: string
    email?: string
    telefone?: string
    totalVisitas?: number
    valorTotal?: number
  }>>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    // Validar tipo de arquivo
    const validExtensions = ['.xlsx', '.xls']
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    const hasValidExtension = validExtensions.some(ext => 
      selectedFile.name.toLowerCase().endsWith(ext)
    )
    const hasValidMimeType = validMimeTypes.includes(selectedFile.type)
    
    if (!hasValidExtension && !hasValidMimeType) {
      alert('Formato de arquivo inválido. Use .xlsx ou .xls')
      return
    }

    console.log('Arquivo selecionado:', selectedFile.name, selectedFile.type, selectedFile.size)
    setFile(selectedFile)
    generatePreview(selectedFile)
  }

  const generatePreview = async (selectedFile: File) => {
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/clients/preview', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewData(data.preview || [])
      } else {
        console.error('Erro ao gerar preview')
        setPreviewData([])
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error)
      setPreviewData([])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/clients/import', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.results)
      } else {
        const errorData = await response.json()
        alert(`Erro na importação: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro na importação:', error)
      alert('Erro interno durante a importação')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreviewData([])
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        nome: 'Ana Silva',
        email: 'ana.silva@email.com',
        telefone: '(11) 99999-0001',
        dataNascimento: '1990-05-15',
        endereco: 'Rua Exemplo, 123 - Centro',
        observacoes: 'Cliente fiel',
        totalVisitas: 5,
        valorTotal: 450.00,
        ultimaVisita: '2024-01-15',
        servicosRealizados: 'Corte, Hidratação, Coloração',
        ticketMedio: 90.00
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
    XLSX.writeFile(wb, 'template_clientes.xlsx')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/admin/clientes"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Importar Clientes</h1>
              <p className="mt-2 text-sm text-gray-700">
                Importe dados históricos dos clientes via planilha Excel
              </p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Template
          </button>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-blue-900 mb-4">Instruções de Importação</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Campos Obrigatórios:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>nome</strong> - Nome completo do cliente</li>
              <li>• <strong>email</strong> - Email único do cliente</li>
              <li>• <strong>telefone</strong> - Telefone do cliente</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Campos Opcionais:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>dataNascimento</strong> - Data de nascimento</li>
              <li>• <strong>endereco</strong> - Endereço completo</li>
              <li>• <strong>observacoes</strong> - Observações sobre o cliente</li>
              <li>• <strong>totalVisitas</strong> - Número total de visitas</li>
              <li>• <strong>valorTotal</strong> - Valor total gasto</li>
              <li>• <strong>ultimaVisita</strong> - Data da última visita</li>
              <li>• <strong>servicosRealizados</strong> - Serviços já realizados (separados por vírgula)</li>
              <li>• <strong>ticketMedio</strong> - Valor médio por visita</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!file && (
        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? 'Solte o arquivo aqui' : 'Arraste e solte sua planilha Excel ou clique para selecionar'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Formatos aceitos: .xlsx, .xls (máximo 10MB)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Selecionar Arquivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* File Selected */}
      {file && (
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewData.length > 0 && (
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Preview dos Dados ({previewData.length} registros)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Gasto</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{row.nome || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.telefone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.totalVisitas || '0'}</td>
                                             <td className="px-6 py-4 text-sm text-gray-900">
                         R$ {row.valorTotal ? parseFloat(row.valorTotal.toString()).toFixed(2) : '0,00'}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <div className="p-4 text-center text-sm text-gray-600">
                  Mostrando 5 de {previewData.length} registros
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && (
        <div className="mb-8">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Importar Clientes
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resultado da Importação</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-blue-600">Total Processado</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.created}</div>
                <div className="text-sm text-green-600">Novos Clientes</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{result.updated}</div>
                <div className="text-sm text-yellow-600">Clientes Atualizados</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-red-800 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Erros ({result.errors.length})
                </h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.details.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Detalhes da Importação
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {result.details.slice(0, 10).map((detail, index) => (
                    <div key={index} className="text-sm text-gray-700 mb-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                        detail.action === 'created' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {detail.action === 'created' ? 'CRIADO' : 'ATUALIZADO'}
                      </span>
                      {detail.name} ({detail.email})
                    </div>
                  ))}
                  {result.details.length > 10 && (
                    <div className="text-xs text-gray-500 mt-2">
                      ... e mais {result.details.length - 10} registros
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


