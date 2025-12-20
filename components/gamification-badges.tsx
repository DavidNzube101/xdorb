"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, Star, Zap, Shield, Target } from "lucide-react"

interface GamificationBadgesProps {
  performance: number
  uptime: number
  rewards: number
  streak?: number
}

export function GamificationBadges({ performance, uptime, rewards, streak = 0 }: GamificationBadgesProps) {
  const badges = []

  // Top Contributor (high rewards)
  if (rewards > 1000) {
    badges.push({
      icon: Crown,
      label: "Top Contributor",
      color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    })
  }

  // High Performer
  if (performance > 95) {
    badges.push({
      icon: Star,
      label: "High Performer",
      color: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    })
  }

  // Reliability Champion
  if (uptime > 99) {
    badges.push({
      icon: Shield,
      label: "Reliability Champion",
      color: "bg-green-500/20 text-green-600 dark:text-green-400",
    })
  }

  // Power User
  if (rewards > 500) {
    badges.push({
      icon: Zap,
      label: "Power User",
      color: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    })
  }

  // Streak Master
  if (streak > 30) {
    badges.push({
      icon: Target,
      label: "Streak Master",
      color: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    })
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge, index) => (
        <Badge key={index} className={`${badge.color} text-xs`}>
          <badge.icon className="w-3 h-3 mr-1" />
          {badge.label}
        </Badge>
      ))}
    </div>
  )
}