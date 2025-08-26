'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import TagComponent, { Tag, defaultTags } from './Tag'

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  maxTags?: number
}

export default function TagSelector({ selectedTags, onTagsChange, maxTags = 5 }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAddTag = (tag: Tag) => {
    if (selectedTags.length >= maxTags) return
    if (!selectedTags.find(t => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag])
    }
    setIsOpen(false)
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  const availableTags = defaultTags.filter(tag => 
    !selectedTags.find(selected => selected.id === tag.id)
  )

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags de Classificação
      </label>
      
      {/* Tags Selecionadas */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map((tag) => (
          <TagComponent
            key={tag.id}
            tag={tag}
            onRemove={handleRemoveTag}
            removable={true}
            size="sm"
          />
        ))}
        
        {selectedTags.length < maxTags && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Adicionar Tag
          </button>
        )}
      </div>

      {/* Dropdown de Tags */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Selecionar Tags</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TagComponent tag={tag} size="sm" />
                </button>
              ))}
            </div>
            
            {availableTags.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Todas as tags foram selecionadas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tags Disponíveis (Preview) */}
      {!isOpen && selectedTags.length === 0 && (
        <div className="text-sm text-gray-500">
          Clique em "Adicionar Tag" para classificar este agendamento
        </div>
      )}
    </div>
  )
}


