"use client"

import { ExternalLink } from "lucide-react"

export function FooterContent() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
      <div className="flex items-center gap-4">
        <span>© 2025 XDOrb</span>
        <a
          href="https://docs.xandeum.network"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          Docs <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="https://discord.gg/uqRSmmM5m"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          Discord <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="flex items-center gap-4">
        <span>Powered by Xandeum</span>
        <span>•</span>
        <a
          href="https://x.com/davidnzubee"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built by Skipp
        </a>
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="px-6 py-4">
        <FooterContent />
      </div>
    </footer>
  )
}