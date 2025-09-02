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
  Eye,
  Clipboard,
  FileSpreadsheet
} from 'lucide-react'

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

export default function ImportarClientesFlexivelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [importMethod, setImportMethod] = useState<'file' | 'text'>('file')
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
    console.log('Arquivo selecionado:', selectedFile.name, selectedFile.type, selectedFile.size)
    setFile(selectedFile)
    setImportMethod('file')
    generatePreviewFromFile(selectedFile)
  }

  const generatePreviewFromFile = async (selectedFile: File) => {
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

  const generatePreviewFromText = () => {
    if (!textInput.trim()) {
      alert('Digite ou cole os dados primeiro')
      return
    }

    try {
      // Processar texto colado
      const lines = textInput.trim().split('\n')
      const headers = lines[0].split('\t') // Assumir que é separado por tab
      
      const data = lines.slice(1).map((line, index) => {
        const values = line.split('\t')
        const row: any = {}
        
        headers.forEach((header, i) => {
          row[header.trim()] = values[i] ? values[i].trim() : ''
        })
        
        return row
      }).filter(row => Object.values(row).some(val => val !== ''))

      setPreviewData(data.slice(0, 10)) // Mostrar apenas os primeiros 10
      setImportMethod('text')
      console.log('Preview gerado de texto:', data.length, 'linhas')
    } catch (error) {
      console.error('Erro ao processar texto:', error)
      alert('Erro ao processar o texto. Verifique o formato.')
    }
  }

  const handleUpload = async () => {
    if (importMethod === 'file' && !file) {
      alert('Selecione um arquivo primeiro')
      return
    }

    if (importMethod === 'text' && !textInput.trim()) {
      alert('Digite ou cole os dados primeiro')
      return
    }

    setIsUploading(true)
    setResult(null)

    try {
      let response

      if (importMethod === 'file') {
        // Upload de arquivo
        const formData = new FormData()
        formData.append('file', file!)

        response = await fetch('/api/clients/import', {
          method: 'POST',
          body: formData
        })
      } else {
        // Upload de texto
        response = await fetch('/api/clients/import-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: textInput })
        })
      }

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

  const clearText = () => {
    setTextInput('')
    setPreviewData([])
    setResult(null)
  }

  const downloadTemplate = () => {
    const template = `Nome	Email	Telefone	Data de Nascimento	Endereço	Observações
Adelaide Nascimento	adelaide.nascimento@guapa.com	(19) 99997-4430	1990-01-01	Rua Exemplo, 123 - Centro	Cliente fiel
Adele Motta	adele.motta@guapa.com	(11) 95465-7438	1985-05-15	Av. Principal, 456 - Bairro	Primeira visita`

    const blob = new Blob([template], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-clientes.txt'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Importar Clientes - Método Flexível</h1>
              <p className="mt-2 text-sm text-gray-700">
                Importe dados via arquivo ou cole diretamente a tabela
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
            <h3 className="font-medium text-blue-800 mb-2">Método 1: Upload de Arquivo</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Aceita qualquer tipo de arquivo (.xlsx, .xls, .csv, .txt)</li>
              <li>• Arraste e solte ou clique para selecionar</li>
              <li>• O sistema detectará automaticamente o formato</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Método 2: Colar Tabela</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Cole diretamente a tabela do Excel/Google Sheets</li>
              <li>• Use o template como referência</li>
              <li>• Ideal para dados copiados de outras fontes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seleção de Método */}
      <div className="mb-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setImportMethod('file')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              importMethod === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
            Upload de Arquivo
          </button>
          <button
            onClick={() => setImportMethod('text')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              importMethod === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clipboard className="w-4 h-4 inline mr-2" />
            Colar Tabela
          </button>
        </div>
      </div>

      {/* Método 1: Upload de Arquivo */}
      {importMethod === 'file' && (
        <>
          {!file && (
            <div className="mb-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {dragActive ? 'Solte o arquivo aqui' : 'Arraste e solte qualquer arquivo ou clique no botão abaixo'}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Formatos aceitos: .xlsx, .xls, .csv, .txt, ou qualquer outro formato
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Selecionar Arquivo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

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
        </>
      )}

      {/* Método 2: Colar Tabela */}
      {importMethod === 'text' && (
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <Clipboard className="w-5 h-5 inline mr-2" />
              Cole sua tabela aqui
            </h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Cole aqui a tabela do Excel/Google Sheets...&#10;Exemplo:&#10;Nome	Email	Telefone	Data de Nascimento	Endereço&#10;Adelaide Nascimento	adelaide@guapa.com	(19) 99997-4430	1990-01-01	Rua Exemplo, 123"
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <div className="mt-4 flex space-x-3">
              <button
                onClick={generatePreviewFromText}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Gerar Preview
              </button>
              <button
                onClick={clearText}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4 inline mr-2" />
                Limpar
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
                    {Object.keys(previewData[0] || {}).map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-6 py-4 text-sm text-gray-900">
                          {String(value || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {((importMethod === 'file' && file) || (importMethod === 'text' && textInput.trim())) && (
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
