"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import useSWR from "swr"
import { apiClient } from "@/lib/api"

const rewardsFetcher = async () => {
  const result = await apiClient.getDashboardStats()
  if (result.error) throw new Error(result.error)
  return result.data
}

export default function RewardChartEmbed() {
  const { data: stats, isLoading } = useSWR("dashboard/rewards", rewardsFetcher, {
    refreshInterval: 30000,
  })

  // Mock reward distribution data
  const rewardData = [
    { tier: "Premium", rewards: 125000 },
    { tier: "Advanced", rewards: 85000 },
    { tier: "Standard", rewards: 55000 },
    { tier: "Basic", rewards: 15000 },
  ]

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-4 bg-background text-foreground">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Reward Distribution</h2>
        <p className="text-sm text-muted-foreground">Total: {(stats?.totalRewards || 0).toLocaleString()} POL</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={rewardData}>
          <XAxis
            dataKey="tier"
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <Bar dataKey="rewards" fill="var(--color-primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}