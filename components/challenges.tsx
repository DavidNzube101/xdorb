"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Clock, Award } from "lucide-react"

interface Challenge {
  id: string
  title: string
  description: string
  progress: number
  target: number
  reward: string
  deadline: string
  type: "weekly" | "monthly"
}

export function Challenges() {
  const challenges: Challenge[] = [
    {
      id: "uptime-champion",
      title: "Uptime Champion",
      description: "Maintain 99.9% uptime for 7 days",
      progress: 85,
      target: 100,
      reward: "500 POL Bonus",
      deadline: "2 days left",
      type: "weekly",
    },
    {
      id: "reward-hunter",
      title: "Reward Hunter",
      description: "Earn 1000 POL this month",
      progress: 650,
      target: 1000,
      reward: "Exclusive Badge",
      deadline: "12 days left",
      type: "monthly",
    },
    {
      id: "consistency-king",
      title: "Consistency King",
      description: "No downtime for 30 days",
      progress: 22,
      target: 30,
      reward: "Legendary Status",
      deadline: "8 days left",
      type: "monthly",
    },
  ]

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Active Challenges
        </CardTitle>
        <CardDescription>Complete challenges to earn rewards and badges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
              <Badge variant="outline" className="ml-2">
                {challenge.type === "weekly" ? <Clock className="w-3 h-3 mr-1" /> : <Award className="w-3 h-3 mr-1" />}
                {challenge.type}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {challenge.progress} / {challenge.target}
                </span>
              </div>
              <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{challenge.reward}</span>
              </div>
              <span className="text-xs text-muted-foreground">{challenge.deadline}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}