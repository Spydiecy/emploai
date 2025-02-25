import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/navbar'
import { Web3Provider } from '@/contexts/Web3Context';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EmploAI - The Future of AI Agent Employment',
  description: 'Revolutionizing workforce management with AI agent employment platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Web3Provider>
            <Navbar />
            {children}
          </Web3Provider>
        </Providers>
      </body>
    </html>
  )
}