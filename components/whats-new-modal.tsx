"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Users, 
  Calculator, 
  BarChart3, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  CheckCircle2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { apiClient } from "@/lib/api"
import { cn } from "@/lib/utils"

const IconMap: Record<string, any> = {
  "zap": Zap,
  "users": Users,
  "calculator": Calculator,
  "bar-chart": BarChart3,
  "globe": Globe,
}

export function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<{ id: string; version: string; updates: any[] } | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const response = await apiClient.getWhatsNew()
        if (response.data && response.data.updates.length > 0) {
          const lastSeenId = localStorage.getItem("xdorb-whats-new-id")
          if (lastSeenId !== response.data.id) {
            setData(response.data)
            setIsOpen(true)
          }
        }
      } catch (err) {
        console.error("Failed to check for updates:", err)
      }
    }

    // Delay slightly to not conflict with initial animations
    const timer = setTimeout(checkUpdates, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = (dontShowAgain: boolean) => {
    if (dontShowAgain && data) {
      localStorage.setItem("xdorb-whats-new-id", data.id)
    }
    setIsOpen(false)
  }

  const next = () => {
    if (data && currentStep < data.updates.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  if (!data) return null

  const update = data.updates[currentStep]
  const Icon = IconMap[update.icon] || Sparkles

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose(false)}>
      <DialogContent className="max-w-md bg-background border-border rounded-none p-0 overflow-hidden">
        <div className="sr-only">
          <DialogTitle>What's New in XDOrb</DialogTitle>
          <DialogDescription>Discover the latest features and updates.</DialogDescription>
        </div>

        <div className="relative">
          {/* Header Image/Background */}
          <div className="h-32 bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center border-b border-border">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-background border border-primary/20 rounded-none shadow-2xl shadow-primary/10"
            >
              <Icon className="w-10 h-10 text-primary" />
            </motion.div>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="rounded-none bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]">
                what's new?
              </Badge>
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                {update.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {update.description}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5">
              {data.updates.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 transition-all duration-300 rounded-none",
                    i === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              {currentStep > 0 ? (
                <Button variant="outline" className="flex-1 rounded-none uppercase font-bold text-xs" onClick={prev}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <Button variant="ghost" className="flex-1 rounded-none uppercase font-bold text-xs text-muted-foreground" onClick={() => handleClose(true)}>
                  Skip All
                </Button>
              )}

              {currentStep < data.updates.length - 1 ? (
                <Button className="flex-1 rounded-none uppercase font-bold text-xs" onClick={next}>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button className="flex-1 rounded-none uppercase font-bold text-xs gap-2" onClick={() => handleClose(true)}>
                  <CheckCircle2 className="w-4 h-4" /> Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
