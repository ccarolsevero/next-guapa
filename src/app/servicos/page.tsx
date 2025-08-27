'use client'

import LayoutPublic from '../layout-public'

export default function ServicosPage() {
  return (
    <LayoutPublic>
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-16 md:pb-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Nossos Serviços
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              Descubra nossa linha completa de serviços profissionais para cuidar dos seus cabelos
            </p>
            
            {/* Divisor visual */}
            <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-6 md:mt-8"></div>
          </div>
        </div>
      </section>

      {/* Consultoria e Avaliação */}
      <section className="py-2 md:py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Consultoria e Avaliação
            </h2>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              Primeiro passo para um tratamento personalizado
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Avaliação Capilar
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Avaliação completa do couro cabeludo e fios para identificar necessidades específicas.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 60,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Consultoria/Corte
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Consultoria de visagismo + corte personalizado para valorizar seu tipo de cabelo.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 198,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Avaliação + Tratamento
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Avaliação + tratamento personalizado para resultados mais eficazes.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 140,00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cortes */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Cortes
            </h2>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              Cortes personalizados que valorizam a beleza natural dos seus fios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Corte
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Corte de cabelo com manutenção das pontas e acabamento profissional.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 132,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Corte e Tratamento Keune
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Corte + tratamento premium Keune Care para fios mais saudáveis.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 198,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Corte Infantil
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Cuidado especial para os pequenos, com paciência e carinho para deixar as crianças confortáveis.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 40,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Acabamento
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Ajustes finos e definição para finalizar seu visual com perfeição e brilho.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 30,00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Colorimetria */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Colorimetria
            </h2>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              Colorização profissional com produtos de alta qualidade
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Back To Natural - P
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Repigmentação de cabelos loiros para cabelos mais curtos.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 231,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Back To Natural - M
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Repigmentação de cabelos loiros para cabelos médios.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 319,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Back To Natural - G
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Repigmentação de cabelos loiros para cabelos longos.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 385,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Iluminado P
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Iluminado para cabelos até o ombro com técnicas modernas.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 500,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Iluminado M
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Iluminado para cabelos abaixo do ombro com brilho natural.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 605,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Iluminado G
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Iluminado para cabelos longos com efeito deslumbrante.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 715,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Mechas Coloridas
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Mechas localizadas coloridas ou platinadas para um visual único.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 250,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Coloração Keune
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Cobertura de brancos com Tinta Color Keune de alta qualidade.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 121,00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tratamentos */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Tratamentos Naturais
            </h2>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              Tratamentos naturais para fortalecer e revitalizar seus cabelos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Hidratação Natural
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Hidratação com produtos naturais Keune para restaurar a umidade dos fios.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 80,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Reconstrução Capilar
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Fortalece os fios danificados e restaura a estrutura capilar com proteínas naturais.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 120,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Limpeza de Couro Cabeludo
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Limpeza profunda e desintoxicante do couro cabeludo para melhorar a saúde dos folículos.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 100,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Tratamento Anti-Queda
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Tratamento específico para queda de cabelo com produtos naturais.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 150,00</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
              <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                Terapia Capilar Completa
              </h3>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Pacote completo de tratamentos para máxima revitalização dos fios.
              </p>
              <p className="text-2xl font-light text-[#d34d4c] mt-4">R$ 200,00</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
            Pronto para Transformar seus Cabelos?
          </h2>
          <p className="text-lg md:text-xl leading-relaxed font-body mb-8" style={{ color: '#f2dcbc' }}>
            Agende sua consulta e descubra como podemos cuidar dos seus fios com carinho e profissionalismo.
          </p>
          <a 
            href="/login-cliente"
            className="bg-[#d34d4c] text-white px-8 py-4 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg inline-block"
          >
            Agendar Consulta
          </a>
        </div>
      </section>
    </LayoutPublic>
  )
}


