import type { Metadata } from "next";
import { League_Spartan, Lato } from "next/font/google";
import "./globals.css";

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
  title: "Espaço Guapa - Beleza Natural",
  description: "Salão especializado em cabelos naturais - Espaço Guapa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${leagueSpartan.variable} ${lato.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
