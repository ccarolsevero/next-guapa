'use client'

interface StructuredDataProps {
  type: 'organization' | 'localBusiness' | 'service' | 'product'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Espaço Guapa",
          "description": "Salão especializado em cabelos naturais em Leme-SP",
          "url": "https://espacoguapa.com",
          "logo": "https://espacoguapa.com/assents/logoguapa1.svg",
          "image": "https://espacoguapa.com/assents/fotohomeguapa.jpeg",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Doutor Gonçalves da Cunha, 682",
            "addressLocality": "Leme",
            "addressRegion": "SP",
            "addressCountry": "BR",
            "postalCode": "13610-000"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-11-99999-9999",
            "contactType": "customer service",
            "areaServed": "BR",
            "availableLanguage": "Portuguese"
          },
          "sameAs": [
            "https://www.instagram.com/espacoguapa",
            "https://www.facebook.com/espacoguapa"
          ]
        }

      case 'localBusiness':
        return {
          "@context": "https://schema.org",
          "@type": "BeautySalon",
          "name": "Espaço Guapa",
          "description": "Salão especializado em cabelos naturais em Leme-SP",
          "url": "https://espacoguapa.com",
          "image": "https://espacoguapa.com/assents/fotohomeguapa.jpeg",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Doutor Gonçalves da Cunha, 682",
            "addressLocality": "Leme",
            "addressRegion": "SP",
            "addressCountry": "BR",
            "postalCode": "13610-000"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-22.1856",
            "longitude": "-47.3903"
          },
          "telephone": "+55-11-99999-9999",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "09:00",
              "closes": "18:00"
            }
          ],
          "priceRange": "$$",
          "currenciesAccepted": "BRL",
          "paymentAccepted": "Cash, Credit Card, Debit Card, PIX"
        }

      case 'service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": data.name,
          "description": data.description,
          "provider": {
            "@type": "BeautySalon",
            "name": "Espaço Guapa",
            "url": "https://espacoguapa.com"
          },
          "areaServed": {
            "@type": "City",
            "name": "Leme",
            "containedInPlace": {
              "@type": "State",
              "name": "São Paulo"
            }
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock"
          }
        }

      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "image": data.imageUrl,
          "brand": {
            "@type": "Brand",
            "name": "Espaço Guapa"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "BRL",
            "availability": data.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "Espaço Guapa"
            }
          }
        }

      default:
        return {}
    }
  }

  const structuredData = getStructuredData()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
