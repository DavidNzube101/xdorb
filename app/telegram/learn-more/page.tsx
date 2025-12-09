"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, ExternalLink, Bot, Zap, Users, Search, BarChart3, Brain } from "lucide-react"
import Link from "next/link"

export default function TelegramLearnMorePage() {
  const botCommands = [
    { command: "/start", description: "Welcome message and overview" },
    { command: "/help", description: "Show all available commands" },
    { command: "/list_pnodes [limit]", description: "List top pNodes by XDN Score" },
    { command: "/pnode <id>", description: "Get detailed pNode information" },
    { command: "/xdn_score <id>", description: "Quick XDN Score breakdown" },
    { command: "/leaderboard [limit]", description: "Show top pNodes leaderboard" },
    { command: "/network", description: "Network overview statistics" },
    { command: "/search <region>", description: "Find pNodes by region" },
    { command: "/ai_summary [pnode_id]", description: "AI-powered insights" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Bot className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">XDOrb Telegram Bot</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Your personal assistant for Xandeum pNode analytics. Get real-time data, AI insights, and network monitoring directly in Telegram.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <a
              href="https://t.me/XDOrb_Bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                Start Bot
              </Button>
            </a>
            <Link href="/overview">
              <Button variant="outline" size="lg">
                Back to Overview
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle>Real-time Updates</CardTitle>
              </div>
              <CardDescription>Live data from the Xandeum network</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get instant access to the latest pNode statistics, network health, and performance metrics as they happen.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>AI-Powered Insights</CardTitle>
              </div>
              <CardDescription>Intelligent analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receive AI-generated insights about individual pNodes or network-wide trends with actionable recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Community Access</CardTitle>
              </div>
              <CardDescription>Available to everyone, everywhere</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access XDOrb analytics from any device with Telegram. No app installation required beyond Telegram.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Available Commands</CardTitle>
            <CardDescription>All the commands you can use with the bot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {botCommands.map((cmd, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <Badge variant="outline" className="font-mono text-xs">
                    {cmd.command}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cmd.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>How to use the XDOrb Telegram Bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">1</div>
                <div>
                  <p className="font-medium">Start the Bot</p>
                  <p className="text-sm text-muted-foreground">Click the "Start Bot" button above or visit @XDOrb_Bot in Telegram</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">2</div>
                <div>
                  <p className="font-medium">Send /start</p>
                  <p className="text-sm text-muted-foreground">Get a welcome message and overview of available commands</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">3</div>
                <div>
                  <p className="font-medium">Explore Commands</p>
                  <p className="text-sm text-muted-foreground">Try /list_pnodes, /network, or /ai_summary to see the bot in action</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <a
            href="https://t.me/XDOrb_Bot"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              Start Using XDOrb Bot Now
            </Button>
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}