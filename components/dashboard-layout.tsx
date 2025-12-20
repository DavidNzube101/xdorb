"use client"

import { type ReactNode, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Footer, FooterContent } from "./footer"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Server, 
  BarChart3, 
  Trophy, 
  Network, 
  Info, 
  MoreHorizontal,
  Bookmark
} from "lucide-react"

import { PriceMarquee } from "@/components/price-marquee"
import { BuyXandButton } from "@/components/buy-xand-button"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    // Client-side date
    setDate(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }))

    // Timer logic
    const updateTime = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      const ms = String(now.getMilliseconds()).padStart(3, '0')
      setTime(`${h}:${m}:${s}:${ms}`)
    }
    
    updateTime()
    const timerInterval = setInterval(updateTime, 37) // ~27fps update rate is sufficient for ms

    const updateBookmarkCount = () => {
      const saved = localStorage.getItem('bookmarked-pnodes')
      if (saved) {
        try {
          const bookmarks = JSON.parse(saved)
          setBookmarkCount(bookmarks.length)
        } catch (e) {
          setBookmarkCount(0)
        }
      } else {
        setBookmarkCount(0)
      }
    }

    updateBookmarkCount()
    window.addEventListener('storage', updateBookmarkCount)
    
    return () => {
      window.removeEventListener('storage', updateBookmarkCount)
      clearInterval(timerInterval)
    }
  }, [])

  const navItems = [
    { label: "Overview", href: "/overview", icon: LayoutDashboard },
    { label: "pNodes", href: "/pnodes", icon: Server },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Network", href: "/network", icon: Network },
    { label: "About", href: "/about", icon: Info },
    // Keeping Bookmarks as an extra feature, placed last or near relevant items
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark, badge: bookmarkCount },
  ]

  const mobileMainItems = navItems.slice(0, 4) // Home, pNodes
  const mobileMoreItems = navItems.slice(4) // The rest

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      
      {/* Top Left: Logo Widget */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-3 bg-background/60 backdrop-blur-md border border-border px-4 py-3 shadow-lg rounded-none animate-in fade-in slide-in-from-top-4 duration-500">
        <img 
          src="/Logo.png" 
          alt="XDOrb" 
          className="h-8 w-8 rounded-full" 
        />
        <span className="font-bold text-lg tracking-tight">XDOrb</span>
      </div>

      {/* Top Right: Date, Time & Theme Widget */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4 bg-background/60 backdrop-blur-md border border-border px-4 py-2 shadow-lg rounded-none animate-in fade-in slide-in-from-top-4 duration-500">
        <span className="text-sm font-mono hidden xl:inline-block text-muted-foreground">
          {date}
        </span>
        <div className="h-4 w-px bg-border hidden xl:block"></div>
        <span className="text-sm font-mono hidden sm:inline-block text-muted-foreground min-w-[10ch]">
          {time}
        </span>
        <div className="h-4 w-px bg-border hidden sm:block"></div>
        <ThemeToggle />
      </div>

      {/* Desktop Sidebar (Left) */}
      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2 bg-background/60 backdrop-blur-md border border-border p-2 shadow-lg rounded-none w-auto animate-in fade-in slide-in-from-left-4 duration-500">
        <TooltipProvider>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-center p-3 rounded-none transition-all group relative
                      ${isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 h-2 w-2 rounded-none bg-destructive" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="rounded-none font-medium">
                  <div className="flex items-center gap-2">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="secondary" className="h-5 px-1 rounded-none text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </aside>

      {/* Mobile Navigation (Bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around bg-background/80 backdrop-blur-lg border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        {mobileMainItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 py-2 transition-colors
                ${isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          )
        })}

        {/* More Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                flex flex-col items-center justify-center flex-1 py-2 transition-colors outline-none
                ${mobileMoreItems.some(item => pathname === item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] mt-1">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-4 rounded-none border-border bg-background/95 backdrop-blur-md">
            {mobileMoreItems.map((item) => {
              const Icon = item.icon
              return (
                <DropdownMenuItem key={item.href} asChild className="rounded-none cursor-pointer">
                  <Link href={item.href} className="flex items-center gap-2 w-full p-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs rounded-none h-5 px-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Main Content Area */}
      <main className="min-h-screen w-full pt-24 pb-28 md:pl-28 md:pr-6 md:pb-24 px-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 delay-150">
          {children}
        </div>
      </main>
      
      {/* Footer Strategy */}
      
      {/* Mobile Footer: Flows at bottom of content */}
      <div className="md:hidden pb-24">
        <Footer />
      </div>

      {/* Desktop Bottom Bar: Marquee (Left) & Footer (Right) */}
      <div className="fixed bottom-6 left-28 right-6 z-30 hidden md:flex justify-between pointer-events-none gap-4">
        {/* Left: Price Marquee & Buy Button */}
        <div className="bg-background/60 backdrop-blur-md border border-border px-4 py-2 shadow-lg rounded-none pointer-events-auto flex items-center gap-4 w-full max-w-[650px] h-[58px]">
             <div className="flex-1 h-full overflow-hidden flex items-center">
                <PriceMarquee />
             </div>
             <div className="shrink-0">
                <BuyXandButton />
             </div>
        </div>

        {/* Right: Footer Content */}
        <div className="bg-background/60 backdrop-blur-md border border-border px-6 py-3 shadow-lg rounded-none pointer-events-auto flex items-center">
          <FooterContent />
        </div>
      </div>
    </div>
  )
}