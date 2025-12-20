import type { Metadata } from 'next'
import { Plus_Jakarta_Sans as V0_Font_Plus_Jakarta_Sans, IBM_Plex_Mono as V0_Font_IBM_Plex_Mono, Lora as V0_Font_Lora } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { WalletContextProvider } from '@/context/wallet-provider'
import { TutorialCarousel } from '@/components/tutorial-carousel'
import { Toaster } from "@/components/ui/sonner"
import './globals.css'

// Initialize fonts
const plusJakartaSans = V0_Font_Plus_Jakarta_Sans({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800"] })
const ibmPlexMono = V0_Font_IBM_Plex_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700"] })
const lora = V0_Font_Lora({ subsets: ['latin'], weight: ["400","500","600","700"] })

export const metadata: Metadata = {
  title: "XDOrb - Xandeum Analytics Platform",
  description: "Premium pNode Analytics & Monitoring for Xandeum Network",
  icons: {
    icon: [
      {
        url: "/Logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/Logo.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/Logo.png",
  },
  openGraph: {
    title: "XDOrb - Xandeum Analytics Platform",
    description: "Real-time pNode monitoring and analytics for the Xandeum network",
    url: "https://xdorb.vercel.app",
    siteName: "XDOrb",
    images: [
      {
        url: "/XDOrb_Banner.png",
        width: 1200,
        height: 630,
        alt: "XDOrb - Xandeum Analytics Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XDOrb - Xandeum Analytics Platform",
    description: "Real-time pNode monitoring and analytics for the Xandeum network",
    images: ["/XDOrb_Banner.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakartaSans.className}>
        <WalletContextProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <TutorialCarousel />
          </ThemeProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
}
