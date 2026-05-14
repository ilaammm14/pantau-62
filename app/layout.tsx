import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PANTAU+62 — AI Smart City Monitoring',
  description: 'Platform AI untuk monitoring, analisis, prediksi, dan penanganan masalah publik secara real-time.',
  keywords: 'smart city, AI monitoring, public issues, Indonesia, PANTAU62',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-[#020817] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
