"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const loadingMessages = [
  "Booting our infra...",
  "Warming up the engines...",
  "Optimizing for speed...",
  "Almost there...",
  "Just a moment longer...",
]

export function EngagingLoader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length)
    }, 2500) // Change message every 2.5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
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
          className="text-lg text-muted-foreground mt-6"
        >
          {loadingMessages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
