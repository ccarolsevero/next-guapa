import type { Metadata } from "next";
import { League_Spartan, Lato } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import StructuredData from "@/components/StructuredData";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Espaço Guapa - Beleza Natural | Salão de Cabelos Naturais em Leme-SP",
  description: "Salão especializado em cabelos naturais em Leme-SP. Cortes, colorimetria criativa, tratamentos tricoterapêuticos e produtos naturais. Agende sua consulta!",
  keywords: [
    "salão de beleza",
    "cabelos naturais",
    "Leme SP",
    "corte de cabelo",
    "colorimetria",
    "tratamento capilar",
    "tricoterapia",
    "beleza natural",
    "Espaço Guapa"
  ],
  authors: [{ name: "Espaço Guapa" }],
  creator: "Espaço Guapa",
  publisher: "Espaço Guapa",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  metadataBase: new URL('https://espacoguapa.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Espaço Guapa - Beleza Natural",
    description: "Salão especializado em cabelos naturais em Leme-SP. Cortes, colorimetria criativa, tratamentos tricoterapêuticos e produtos naturais.",
    url: 'https://espacoguapa.com',
    siteName: 'Espaço Guapa',
    images: [
      {
        url: '/assents/fotohomeguapa.jpeg',
        width: 1200,
        height: 630,
        alt: 'Espaço Guapa - Salão de Beleza Natural',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Espaço Guapa - Beleza Natural",
    description: "Salão especializado em cabelos naturais em Leme-SP. Cortes, colorimetria criativa, tratamentos tricoterapêuticos e produtos naturais.",
    images: ['/assents/fotohomeguapa.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: 'your-google-verification-code', // Substitua pelo código real
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <StructuredData 
          type="organization" 
          data={{}} 
        />
        <StructuredData 
          type="localBusiness" 
          data={{}} 
        />
      </head>
      <body
        className={`${leagueSpartan.variable} ${lato.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
