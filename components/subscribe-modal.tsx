"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { apiClient } from "@/lib/api"
import { Bell } from "lucide-react"

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
  pNodeId: string
  pNodeName: string
}

export function SubscribeModal({ isOpen, onClose, pNodeId, pNodeName }: SubscribeModalProps) {
  const [email, setEmail] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await apiClient.subscribeToPNode(pNodeId, email, frequency)
      if (result.error) {
        alert(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
            onClose()
            setSuccess(false)
            setEmail("")
        }, 2000)
      }
    } catch (err) {
      alert("Failed to subscribe")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src="/Logo.png" alt="XDOrb" className="w-6 h-6 rounded-full" />
            XDOrb Alerts
          </DialogTitle>
          <DialogDescription>
            Subscribe to {pNodeName} updates.
          </DialogDescription>
        </DialogHeader>
        {success ? (
            <div className="py-6 text-center text-green-500 font-medium">
                Successfully subscribed!
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label>Frequency</Label>
                <RadioGroup value={frequency} onValueChange={setFrequency} className="flex flex-col space-y-2">
                    <Label htmlFor="daily" className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="daily" id="daily" />
                        <span>Daily (00:00 UTC)</span>
                    </Label>
                    <Label htmlFor="twice_daily" className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="twice_daily" id="twice_daily" />
                        <span>Twice Daily (00:00 & 12:00 UTC)</span>
                    </Label>
                </RadioGroup>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                {loading ? "Subscribing..." : "Subscribe"}
                </Button>
            </DialogFooter>
            </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
