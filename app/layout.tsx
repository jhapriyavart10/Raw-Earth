import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import localFont from 'next/font/local'
import Script from 'next/script' 
import './globals.css'
import { CartProvider } from './context/CartContext'
import Footer from '@/components/Footer' 
import FloatingChat from '@/components/FloatingChat'
import NewsletterPopup from '@/components/NewsletterPopup';
import CookieConsent from '@/components/CookieConsent';

const manrope = Manrope({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'], 
  variable: '--font-manrope', 
})

const muslone = localFont({
  src: '../public/assets/font/muslone.otf', 
  variable: '--font-muslone',
})

const lora = localFont({
  src: [
    {
      path: '../public/assets/font/Lora-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/assets/font/Lora-MediumItalic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/assets/font/Lora-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: 'Raw Earth Crystals',
  description: 'E-commerce store for crystals and natural products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const klaviyoKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY;

  return (
    <html lang="en">
      <body className={`${lora.variable} ${manrope.variable} ${muslone.variable} flex flex-col min-h-screen`}>
        
        <Script
          id="klaviyo-onsite"
          strategy="afterInteractive"
          src={`//static.klaviyo.com/onsite/js/klaviyo.js?company_id=${klaviyoKey}`} 
        />

        <CartProvider>
          {/* FIXED: Removed pt-[125px] lg:pt-[165px] to prevent double spacing */}
          <main className="flex-grow">
            {children}
          </main>

          <Footer />
          <NewsletterPopup />
          <CookieConsent />
          <FloatingChat />
        </CartProvider>
      </body>
    </html>
  )
}