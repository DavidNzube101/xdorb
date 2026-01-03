"use client"

import type React from "react"
import useSWR from "swr"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, type DashboardStats, type PNodeMetrics } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Activity, Zap, Award, TrendingUp, Bot, MessageCircle, ExternalLink, Map, BarChart3, Users, LayoutDashboard, Globe } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
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

  const { data: stats, isLoading: statsLoading, mutate: mutateStats } = useSWR<DashboardStats>(
    status?.maintenance ? null : "/dashboard/stats",
    statsFetcher,
    {
      refreshInterval: 0, // Disable polling, use WebSocket
    }
  )

  const { data: pnodes, isLoading: pnodesLoading, mutate: mutatePNodes } = useSWR<PNodeMetrics[]>(
    status?.maintenance ? null : "/pnodes",
    pnodesFetcher,
    {
      refreshInterval: 0, // Disable polling, use WebSocket
    }
  )

  const [search, setSearch] = useState("")
  const [events, setEvents] = useState<Array<{ id: string; type: string; message: string; time: string }>>([])

  useEffect(() => {
    if (status?.maintenance) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const defaultWsUrl = `${protocol}//${window.location.hostname === 'localhost' ? 'localhost:9000' : 'xdorb-backend.onrender.com'}/ws`;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stats_update') {
          mutateStats(data.payload, false);
          // Add a live event for stats update
          setEvents(prev => [{
            id: Date.now().toString(),
            type: 'stats',
            message: `Network stats synchronized: ${data.payload.activeNodes} nodes active`,
            time: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 5));
        } else if (data.type === 'pnodes_update') {
          mutatePNodes(data.payload, false);
          // Add a live event for nodes update
          setEvents(prev => [{
            id: Date.now().toString(),
            type: 'network',
            message: `Global node registry updated (${data.payload.length} nodes)`,
            time: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 5));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    return () => ws.close();
  }, [status, mutateStats, mutatePNodes]);

  if (status === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          src="/Logo.png" 
          alt="Loading..." 
          className="w-24 h-24 rounded-none"
        />
      </div>
    )
  }

  if (status?.maintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full border-primary/20 bg-card/50 backdrop-blur-md rounded-none">
          <CardHeader className="text-center">
            <LayoutDashboard className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle className="text-3xl">System Maintenance</CardTitle>
            <CardDescription className="text-lg">XDOrb is currently upgrading</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">We're enhancing your pNode monitoring experience. Please check back shortly.</p>
          </CardContent>
        </Card>
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
    colorClass,
  }: {
    icon: any
    label: string
    value: number | string
    change?: number
    unit?: string
    extra?: string
    colorClass: string
  }) => (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 transition-all duration-300 rounded-none">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              <div className="flex items-baseline gap-1 mt-2">
                <h3 className="text-3xl font-bold text-foreground">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
                {unit && <span className="text-lg font-medium text-muted-foreground">{unit}</span>}
              </div>
              {change !== undefined && (
                <div
                  className={`flex items-center gap-1 mt-2 text-sm font-medium ${change >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
              {extra && <p className="text-[10px] text-muted-foreground mt-2 font-mono opacity-70">{extra}</p>}
            </div>
            <div className={cn("p-3 rounded-none bg-opacity-10", colorClass)}>
              <Icon className={cn("w-6 h-6", colorClass.replace('bg-', 'text-').replace('/10', ''))} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-none blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-secondary/10 rounded-none blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-4">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 mb-2 px-3 py-1 rounded-none">
                <span className="w-2 h-2 rounded-none bg-primary mr-2 animate-pulse" />
                Live on Mainnet & Devnet
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                <span className="text-primary">Comprehensive Analytics</span> for Xandeum
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Real-time monitoring and intelligent analytics for the global pNode network. Stay ahead with live data streams.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <Link href="/pnodes">
                  <Button size="lg" className="rounded-none px-8 shadow-lg shadow-primary/20">
                    Explore Nodes
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="rounded-none px-8 backdrop-blur-sm">
                    Documentation
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
                <div className="w-64 h-64 relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-none"
                    />
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 border-2 border-dotted border-secondary/30 rounded-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img src="/Logo.png" alt="Xandeum" className="w-32 h-32 rounded-none shadow-2xl border-4 border-background" />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-none animate-pulse" />
            ))
          ) : stats ? (
            <>
              <StatCard 
                icon={Globe} 
                label="Total Network Nodes" 
                value={stats.totalNodes} 
                colorClass="bg-blue-500/10"
                extra="Connected global providers"
              />
              <StatCard 
                icon={Zap} 
                label="Active pNodes" 
                value={stats.activeNodes} 
                colorClass="bg-green-500/10"
                extra="Currently processing packets"
              />
              <StatCard 
                icon={Activity} 
                label="Network Health" 
                value={stats.networkHealth} 
                unit="%" 
                colorClass="bg-primary/10"
                extra={`Fetched in ${stats.fetchTime?.toFixed(2) || '0.00'}s`}
              />
            </>
          ) : null}
        </div>

        {/* Quick Actions Grid */}
        <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/leaderboard" className="group">
                    <Card className="hover:bg-primary/5 transition-all duration-300 border-border bg-card/50 h-full overflow-hidden relative rounded-none">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Award size={80} />
                        </div>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-none text-yellow-500 group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Leaderboard</CardTitle>
                                <CardDescription>Top Performers</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/analytics" className="group">
                    <Card className="hover:bg-primary/5 transition-all duration-300 border-border bg-card/50 h-full overflow-hidden relative rounded-none">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart3 size={80} />
                        </div>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-none text-blue-500 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Analytics</CardTitle>
                                <CardDescription>Deep Dive Data</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/network" className="group">
                    <Card className="hover:bg-primary/5 transition-all duration-300 border-border bg-card/50 h-full overflow-hidden relative rounded-none">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Map size={80} />
                        </div>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-none text-purple-500 group-hover:scale-110 transition-transform">
                                <Map className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Network Map</CardTitle>
                                <CardDescription>Global Coverage</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/network#operators" className="group">
                    <Card className="hover:bg-primary/5 transition-all duration-300 border-border bg-card/50 h-full overflow-hidden relative rounded-none">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users size={80} />
                        </div>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-none text-green-500 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Operators</CardTitle>
                                <CardDescription>Fleet Managers</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Realtime Feed */}
            <div className="lg:col-span-1">
                <Card className="border-border bg-card/50 rounded-none h-full overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary animate-pulse" />
                            Realtime Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <div className="divide-y divide-border">
                            <AnimatePresence initial={false}>
                                {events.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-4 flex flex-col gap-1"
                                    >
                                        <div className="flex justify-between items-center">
                                            <Badge variant="outline" className={cn(
                                                "text-[8px] uppercase font-black px-1.5 h-4 rounded-none",
                                                event.type === 'stats' ? "border-blue-500/20 text-blue-500" : "border-purple-500/20 text-purple-500"
                                            )}>
                                                {event.type}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-mono">{event.time}</span>
                                        </div>
                                        <p className="text-xs font-medium text-foreground leading-tight">{event.message}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {events.length === 0 && (
                                <div className="p-8 text-center">
                                    <p className="text-xs text-muted-foreground italic">Waiting for network heartbeat...</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Telegram Bot */}
            <div className="lg:col-span-2">
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 relative overflow-hidden h-full rounded-none">
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/10 rounded-none blur-3xl opacity-50" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                        <img src="https://img.icons8.com/?size=100&id=oWiuH0jFiU0R&format=png&color=000000" alt="Telegram Bot" className="w-10 h-10 rounded-none" />
                        XDOrb Telegram Bot
                        </CardTitle>
                        <CardDescription className="text-base">AI-powered network monitoring in your pocket</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                        Access real-time pNode analytics, AI-powered insights, and health monitoring directly from Telegram. Get instant alerts and performance reports without leaving your chat app.
                        </p>
                        <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="rounded-none bg-primary/10 text-primary">Real-time Updates</Badge>
                        <Badge variant="secondary" className="rounded-none bg-primary/10 text-primary">AI Node Analysis</Badge>
                        <Badge variant="secondary" className="rounded-none bg-primary/10 text-primary">Instant Alerts</Badge>
                        <Badge variant="secondary" className="rounded-none bg-primary/10 text-primary">Portfolio Tracking</Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="https://t.me/XDOrb_Bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <Button size="lg" className="w-full gap-2 rounded-none shadow-lg shadow-primary/20">
                            <MessageCircle className="w-5 h-5" />
                            Start Monitoring Now
                            </Button>
                        </a>
                        <Link href="/telegram/learn-more" className="flex-1">
                            <Button variant="outline" size="lg" className="w-full gap-2 rounded-none backdrop-blur-sm">
                            Learn More
                            <ExternalLink className="w-5 h-5" />
                            </Button>
                        </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Widgets Preview */}
            <div className="lg:col-span-1">
                <EmbeddableWidgets />
            </div>
        </div>
      </div>
    </DashboardLayout>
  )
}