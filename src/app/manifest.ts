import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Espaço Guapa - Beleza Natural',
    short_name: 'Espaço Guapa',
    description: 'Salão especializado em cabelos naturais em Leme-SP',
    start_url: '/',
    display: 'minimal-ui', // Permite barra de navegação para acessar admin
    background_color: '#ffffff',
    theme_color: '#D15556',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
