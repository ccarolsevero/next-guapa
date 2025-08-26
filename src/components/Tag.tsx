import { X } from 'lucide-react'

export interface Tag {
  id: string
  name: string
  color: string
  bgColor: string
  textColor: string
  borderColor: string
}

export const defaultTags: Tag[] = [
  {
    id: 'first-visit',
    name: 'Primeira Visita',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  {
    id: 'coloring',
    name: 'Coloração',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200'
  },
  {
    id: 'cut',
    name: 'Corte',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  {
    id: 'treatment',
    name: 'Tratamento',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200'
  },
  {
    id: 'makeup',
    name: 'Maquiagem',
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-200'
  },
  {
    id: 'vip',
    name: 'Cliente VIP',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  {
    id: 'urgent',
    name: 'Urgente',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  },
  {
    id: 'special-request',
    name: 'Pedido Especial',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200'
  }
]

interface TagProps {
  tag: Tag
  onRemove?: (tagId: string) => void
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
}

export default function TagComponent({ tag, onRemove, size = 'md', removable = false }: TagProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${tag.bgColor} ${tag.textColor} ${tag.borderColor}
      ${sizeClasses[size]}
    `}>
      {tag.name}
      {removable && onRemove && (
        <button
          onClick={() => onRemove(tag.id)}
          className="ml-1 hover:opacity-70 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}


