"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface TypewriterProps {
  text: string
  delay?: number
}

export function Typewriter({ text, delay = 30 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, delay)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, delay, text])

  return (
    <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
      {displayedText}
      <span className="animate-pulse inline-block w-2 h-4 bg-primary align-middle ml-1" />
    </div>
  )
}
