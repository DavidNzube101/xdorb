"use client"

import type React from "react"
import useSWR from "swr"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, type DashboardStats, type PNodeMetrics } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Activity, Zap, Award, TrendingUp, Bot, MessageCircle, ExternalLink, Map, BarChart3 } from "lucide-react"
import Link from "next/link"
import { NotificationManager } from "@/components/notification-manager"
import { EmbeddableWidgets } from "@/components/embeddable-widgets"

const statsFetcher = async () => {
  const result = await apiClient.getDashboardStats()
  if (result.error) throw new Error(result.error)
  return result.data
}

const pnodesFetcher = async () => {
  const result = await apiClient.getPNodes()
  if (result.error) throw new Error(result.error)
  return result.data
}

export default function DashboardPage() {
  const { data: status } = useSWR("/api/status", async () => {
    const res = await fetch("/api/status")
    return res.json()
  })

  const { data: stats, isLoading: statsLoading } = useSWR<DashboardStats>(
    status?.maintenance ? null : "/dashboard/stats",
    statsFetcher,
    {
      refreshInterval: 30000,
    }
  )

  const { data: pnodes, isLoading: pnodesLoading } = useSWR<PNodeMetrics[]>(
    status?.maintenance ? null : "/pnodes",
    pnodesFetcher,
    {
      refreshInterval: 30000,
    }
  )

  if (status === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img 
          src="/Logo.png" 
          alt="Loading..." 
          className="w-24 h-24 rounded-full animate-pulse"
        />
      </div>
    )
  }

  if (status?.maintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">XDOrb</h1>
          <p className="text-xl text-muted-foreground">Currently in maintenance</p>
          <p className="text-sm text-muted-foreground mt-2">Please check back later</p>
        </div>
      </div>
    )
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    unit,
    extra,
  }: {
    icon: React.ComponentType<{ className: string }>
    label: string
    value: number
    change?: number
    unit?: string
    extra?: string
  }) => (
    <Card className="border-border bg-card hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {(value || 0).toLocaleString()}
              {unit && <span className="text-lg ml-1">{unit}</span>}
            </p>
            {change !== undefined && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
            {extra && <p className="text-xs text-muted-foreground mt-1">{extra}</p>}
          </div>
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">XDOrb Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time pNode network monitoring</p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Total Nodes" value={stats.totalNodes} change={5.2} />
            <StatCard icon={Zap} label="Active Nodes" value={stats.activeNodes} change={2.1} />
            <StatCard icon={TrendingUp} label="Network Health" value={stats.networkHealth} unit="%" extra={`Fetched ${stats.totalNodes} nodes in ${stats.fetchTime?.toFixed(1) || '0.0'}s`} />
            <StatCard
              icon={Award}
              label="Total Rewards"
              value={Math.floor(stats.totalRewards)}
              unit="POL"
              change={12.5}
            />
          </div>
        ) : null}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/leaderboard" className="block">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-border bg-card">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Leaderboard</CardTitle>
                            <CardDescription>View top performers</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
            <Link href="/analytics" className="block">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-border bg-card">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Analytics</CardTitle>
                            <CardDescription>Deep dive metrics</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
            <Link href="/network" className="block">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-border bg-card">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                            <Map className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Network Map</CardTitle>
                            <CardDescription>Global distribution</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
        </div>

        {/* Telegram Bot */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="https://img.icons8.com/?size=100&id=oWiuH0jFiU0R&format=png&color=000000" alt="Telegram Bot" className="w-[30px] h-[30px]" />
              XDOrb Telegram Bot
            </CardTitle>
            <CardDescription>Your personal assistant for Xandeum pNode analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get real-time pNode analytics, AI-powered insights, and network monitoring directly in Telegram. Access live data, track performance, and receive intelligent recommendations about your favorite pNodes.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Real-time Updates</Badge>
              <Badge variant="outline">AI Insights</Badge>
              <Badge variant="outline">Easy Access</Badge>
              <Badge variant="outline">No App Required</Badge>
            </div>
            <div className="flex gap-3">
              <Link href="/telegram/learn-more">
                <Button variant="outline" size="sm" className="gap-2">
                  Learn More
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
              <a
                href="https://t.me/XDOrb_Bot"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Start Bot
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

         {/* Notifications - Removed as per request */}
         {/* <NotificationManager /> */}

          {/* Embeddable Widgets */}
          <EmbeddableWidgets />

          {/* Recent Activity - Removed as per request */}
          {/*
          {stats && (
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Network Health</p>
                <p className="text-2xl font-bold text-foreground">{stats.networkHealth?.toFixed(1) ?? 'N/A'}%</p>
                <p className="text-xs text-muted-foreground mt-1">Fetched {stats.totalNodes || 'N/A'} nodes in {stats.fetchTime?.toFixed(1) ?? 'N/A'}s</p>
              </CardContent>
            </Card>
          )}
          */}
      </div>
    </DashboardLayout>
  )
}
