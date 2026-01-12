"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calculator, BarChart2, Skull, Code, Terminal, Activity, Send } from "lucide-react"
import { useRouter } from "next/navigation"

interface UtilitiesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UtilitiesModal({ isOpen, onClose }: UtilitiesModalProps) {
  const router = useRouter()

  const utilities = [
    {
      title: "STOINC Calculator",
      description: "Estimate your rewards",
      icon: Calculator,
      action: () => {
        router.push("/analytics#stoinc") 
        onClose()
      }
    },
    {
      title: "Node Compare",
      description: "Analyze fleet performance",
      icon: BarChart2,
      action: () => {
        router.push("/analytics#compare")
        onClose()
      }
    },
    {
      title: "Catacombs",
      description: "Historical node data",
      icon: Skull,
      action: () => {
        router.push("/catacombs")
        onClose()
      }
    },
    {
      title: "Developers",
      description: "API docs & keys",
      icon: Code,
      action: () => {
        router.push("/developers")
        onClose()
      }
    },
    {
      title: "Trading Terminal",
      description: "Swap & Chart view",
      icon: Terminal,
      action: () => {
        router.push("/overview#terminal") 
        onClose()
      }
    },
    {
      title: "Telegram Bot",
      description: "Get alerts on TG",
      icon: Send,
      action: () => {
        window.open("https://t.me/XDOrb_Bot", "_blank")
        onClose()
      }
    },
    {
      title: "Realtime Feed",
      description: "Live network events",
      icon: Activity,
      action: () => {
        router.push("/overview#feed")
        onClose()
      }
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-border p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="XDOrb" className="w-8 h-8 rounded-full" />
            <div>
                <DialogTitle>XDOrb Utilities</DialogTitle>
                <DialogDescription>Quick access to powerful tools.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1 bg-muted/20">
            {utilities.map((util) => (
                <Button
                    key={util.title}
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-24 gap-2 hover:bg-background hover:shadow-sm transition-all rounded-md m-1"
                    onClick={util.action}
                >
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <util.icon className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-sm">{util.title}</div>
                        <div className="text-[10px] text-muted-foreground">{util.description}</div>
                    </div>
                </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
