
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/Logo.png"
            alt="XDOrb Logo"
            width={200}
            height={200}
            className="rounded-[50pc] animate-[spin_3s_linear_infinite]"
          />
        </div>
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Oopsie! You took a wrong turn at Albuquerque. Click here to turn around.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/overview">Overview</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
