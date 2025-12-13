"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"

interface TypewriterProps {
  text: string
  delay?: number
  className?: string
}

export function Typewriter({ text, delay = 20, className = "" }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Reset the typewriter effect when the text prop changes
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, delay)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, delay, text])

  // Add a blinking cursor to the end of the text only while typing
  const textToRender = currentIndex < text.length 
    ? displayedText + "▋" 
    : displayedText;

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
        <ReactMarkdown
        components={{
            h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
            strong: ({node, ...props}) => <strong className="text-primary" {...props} />,
        }}
        >
        {textToRender}
        </ReactMarkdown>
    </div>
  )
}