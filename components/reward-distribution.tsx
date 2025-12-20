"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RewardTierProps {
  tier: string
  percentage: number
  rewards: number
  color: string
}

const tiers: RewardTierProps[] = [
  { tier: "Premium", percentage: 45, rewards: 125000, color: "var(--color-primary)" },
  { tier: "Advanced", percentage: 30, rewards: 85000, color: "var(--color-secondary)" },
  { tier: "Standard", percentage: 20, rewards: 55000, color: "#3b82f6" },
  { tier: "Basic", percentage: 5, rewards: 15000, color: "#8b5cf6" },
]

export function RewardDistribution() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Reward Distribution</CardTitle>
        <CardDescription>Rewards by performance tier</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.tier} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">{tier.tier}</span>
                <Badge variant="outline">{tier.percentage}%</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${tier.percentage}%`,
                    backgroundColor: tier.color,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{tier.rewards.toLocaleString()} POL</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
