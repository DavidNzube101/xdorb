"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

const tutorialSteps = [
  {
    title: "Welcome to XDOrb",
    description: "Your mission control for the Xandeum pNode network. This quick tour will show you the key features.",
    image: "/tutorial_images/Welcome-to-XDOrb.png"
  },
  {
    title: "The Overview Page",
    description: "Start here for a high-level summary of network health, active nodes, and quick actions.",
    image: "/tutorial_images/The-Overview-Page.png"
  },
  {
    title: "The pNodes List",
    description: "Find, sort, and filter every node on the network. Switch between a detailed list and a quick grid view.",
    image: "/tutorial_images/The-pNodes-List.png"
  },
  {
    title: "Deep Analytics",
    description: "Dive into real-time charts for Storage, CPU, RAM, and Network Traffic on the Analytics page.",
    image: "/tutorial_images/Deep-Analytics.png"
  },
  {
    title: "The Leaderboard",
    description: "See who's at the top with our Bento Grid summary, featuring season leaders and rising stars.",
    image: "/tutorial_images/The-Leaderboard.png"
  },
  {
    title: "Network Page",
    description: "Visualize the global distribution of nodes with our interactive 3D Globe and 2D Heatmap.",
    image: "/tutorial_images/Network-Page.png"
  },
  {
    title: "Telegram Bot",
    description: "Get real-time alerts and run commands from anywhere using our powerful Telegram Bot.",
    image: "/tutorial_images/Telegram-Bot.png"
  },
  {
    title: "Bookmarks",
    description: "Save your favorite nodes for quick access. Your bookmarked list is available across all your devices.",
    image: "/tutorial_images/Bookmarks.png"
  },
  {
    title: "Trading Terminal",
    description: "Swap tokens directly on XDOrb using our integrated Jupiter-powered trading terminal.",
    image: "/tutorial_images/Trading-Terminal.png"
  }
];

export function TutorialCarousel() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(true)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem("hasCompletedTutorial") === "true"
    setHasCompleted(completed)
    if (!completed) {
      setTimeout(() => setIsOpen(true), 1000) // Delay opening a bit
    }
  }, [])

  const handleFinish = () => {
    localStorage.setItem("hasCompletedTutorial", "true")
    setIsOpen(false)
  }

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem("hasCompletedTutorial", "true")
    }
    setIsOpen(false)
  }
  
  if (hasCompleted) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 border-border bg-card">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to XDOrb</DialogTitle>
            <DialogDescription>A quick guide to get you started.</DialogDescription>
          </DialogHeader>
        </div>
        
        <Carousel className="w-full overflow-hidden">
          <CarouselContent className="flex">
            {tutorialSteps.map((step, index) => (
              <CarouselItem key={index} className="min-w-full">
                <div className="p-1">
                  <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="flex flex-col gap-4 p-6 pt-0">
                      <div className="relative w-full h-56 rounded-lg overflow-hidden">
                        <Image src={step.image} alt={step.title} layout="fill" objectFit="cover" />
                      </div>
                      <div className="text-center px-4 h-24"> {/* Set a fixed height */}
                        <h4 className="font-bold text-lg text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-2 text-balance">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="px-12 py-4">
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </Carousel>
        
        <DialogFooter className="flex-row justify-between items-center px-6 py-4 bg-muted/50 border-t">
            <div className="flex items-center space-x-2">
                <Checkbox id="dont-show-again" checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(Boolean(checked))} />
                <label
                    htmlFor="dont-show-again"
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                    Don't show again
                </label>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={handleSkip}>Skip Tour</Button>
                <Button onClick={handleFinish}>Finish</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
