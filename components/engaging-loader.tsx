"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const loadingMessages = [
  "ProTip: Select two nodes and click 'Compare' to get an AI-powered performance analysis.",
  "ProTip: Access the full-screen Trading Terminal to view charts and swap tokens instantly.",
  "ProTip: Embed live network stats on your own website using our custom Widgets.",
  "ProTip: Check the Analytics page for real-time charts on CPU, RAM, and Storage usage.",
  "ProTip: Use the Telegram Bot to get instant alerts when your favorite node goes offline.",
  "ProTip: Visit the Leaderboard to see the top-performing nodes ranked by XDN Score.",
  "ProTip: Bookmark nodes to create a personalized watchlist for quick access.",
  "ProTip: Press Command+K to open the search palette and find nodes instantly.",
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
