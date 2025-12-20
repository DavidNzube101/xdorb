"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const loadingMessages = [
  "ProTip: Use the Telegram bot to get real-time pNode alerts!",
  "ProTip: The Analytics page uses Firestore snapshots for instant data loading.",
  "ProTip: Check the Leaderboard for top-performing pNodes and rising stars!",
  "ProTip: Explore the Network page in 3D for a global view of node distribution.",
  "ProTip: Easily share pNode data on X or Telegram from any detail page.",
  "ProTip: You can self-host XDOrb! Check the Docs for setup instructions.",
  "ProTip: AI insights help you compare nodes and understand network health.",
]

export function EngagingLoader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length)
    }, 3500) // Change message every 3.5 seconds for longer tips

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground relative">
      <Image
        src="/Logo.png"
        alt="Loading..."
        width={80}
        height={80}
        className="animate-spin rounded-full"
        style={{ animationDuration: '3s' }}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="text-lg text-muted-foreground mt-6 text-center max-w-md px-4"
        >
          {loadingMessages[index]}
        </motion.p>
      </AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ delay: 2, duration: 0.8, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg text-center"
      >
        <p className="text-sm text-muted-foreground max-w-4xl mx-auto">
          <strong>Backend status:</strong> Core infrastructure is optimized with a warm-start ritual, ensuring immediate responsiveness and zero cold-start latency.
        </p>
      </motion.div>
    </div>
  )
}
