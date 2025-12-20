'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Loading() {
  const [isChecking, setIsChecking] = useState(true)
  const [blocks, setBlocks] = useState<Array<{ left: number; delay: number; duration: number }>>([])

  // Generate random values only on client side to avoid hydration mismatch
  useEffect(() => {
    setBlocks([...Array(15)].map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    })))
  }, [])

  useEffect(() => {
    const checkService = async () => {
      try {
        // Ping the leaderboard endpoint on the external backend
        const apiBase = process.env.API_BASE || '/api'
        const apiKey = process.env.API_KEY

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        if (apiKey && apiBase.startsWith('http')) {
          headers['Authorization'] = `Bearer ${apiKey}`
        }

        const response = await fetch(`${apiBase}/leaderboard`, {
          headers
        })

        if (response.ok) {
          setIsChecking(false)
          // Services are ready - Next.js will automatically show the page component
        } else {
          // Keep checking every 3 seconds
          setTimeout(checkService, 3000)
        }
      } catch (error) {
        // Keep checking on error
        setTimeout(checkService, 3000)
      }
    }

    checkService()
  }, [])

  // If services are ready, return null to let Next.js show the page
  if (!isChecking) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Falling blocks animation */}
      <div className="absolute inset-0 pointer-events-none">
        {blocks.map((block, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-primary/30 rounded-sm animate-fall"
            style={{
              left: `${block.left}%`,
              animationDelay: `${block.delay}s`,
              animationDuration: `${block.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-6 p-8 relative z-10">
        <div className="flex justify-center mb-8">
          <Image
            src="/Logo.png"
            alt="XDOrb Logo"
            width={200}
            height={200}
            className="rounded-[50pc] animate-[spin_3s_linear_infinite]"
          />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Checking Core Services</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Waking up the backend services... This might take a moment on our free tier hosting.
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}
