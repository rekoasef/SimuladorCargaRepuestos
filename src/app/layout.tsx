import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast' // <-- 1. IMPORTAR

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Simulador de Carga',
  description: 'Creado con Gemini y Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster // <-- 2. AÑADIR EL COMPONENTE
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            className: '',
            style: {
              background: '#334155', // bg-slate-700
              color: '#FFFFFF',
            },
          }}
        />
      </body>
    </html>
  )
}