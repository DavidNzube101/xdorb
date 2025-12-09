"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, MessageCircle, Package, Code, Terminal, Globe } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">About XDOrb</h1>
          <p className="text-muted-foreground mt-1">Learn more about the Xandeum network and pNode analytics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>What is Xandeum?</CardTitle>
              <CardDescription>The future of scalable blockchain storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Xandeum is building a scalable storage layer for Solana dApps. We think of it as a second tier of Solana accounts that can grow to exabytes and beyond. This lives on its own network of storage provider nodes, which we call pNodes.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Scalable</Badge>
                  <span className="text-sm">Exabyte-scale storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Decentralized</Badge>
                  <span className="text-sm">Network of pNodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Solana Native</Badge>
                  <span className="text-sm">Built for Solana ecosystem</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
            <CardTitle>About XDOrb</CardTitle>
            <CardDescription>Xandeum analytics platform for pNode monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                XDOrb is a comprehensive analytics platform providing real-time monitoring and insights for Xandeum pNodes. Built by <a href="https://x.com/DavidNzubee" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Skipp</a>.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Real-time</Badge>
                  <span className="text-sm">Live data updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">AI-Powered</Badge>
                  <span className="text-sm">Predictive analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Interactive</Badge>
                  <span className="text-sm">Customizable widgets</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Connect with XDOrb</CardTitle>
            <CardDescription>Join the community and stay updated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="https://discord.gg/uqRSmmM5m"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <MessageCircle className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-medium">Discord</div>
                  <div className="text-sm text-muted-foreground">Join the Official Xandeum Discord Community</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>

              <a
                href="https://xandeum.network"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <ExternalLink className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-medium">Website</div>
                  <div className="text-sm text-muted-foreground">Visit Xandeum's website</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>

              <a
                href="https://github.com/DavidNzube101/xborb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <Github className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-medium">GitHub</div>
                  <div className="text-sm text-muted-foreground">View source code</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-baseline gap-2">
              <CardTitle>Tooling</CardTitle>
              <span className="text-sm text-muted-foreground">(from the developer)</span>
            </div>
            <CardDescription>
              The developer while building XDOrb has developer clients for interacting with Xandeum pNode pRPC APIs making the already existing method/way via raw HTTPS calls programmatic, simple, reusable and flexible. It's currently available for Rust, Typescript, Javascript and Go.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <a
                href="https://www.npmjs.com/package/xandeum-prpc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                   <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-medium">JS/TS Client</div>
                  <div className="text-xs text-muted-foreground">NPM Package</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>

              <a
                href="https://crates.io/crates/xandeum-prpc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/30 transition-colors">
                   <Code className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="font-medium">Rust Client</div>
                  <div className="text-xs text-muted-foreground">Crates.io</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>

              <a
                href="https://github.com/DavidNzube101/xandeum-prpc-go"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                   <Terminal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium">Go Client</div>
                  <div className="text-xs text-muted-foreground">GitHub Repository</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-3">
                See an example implementation of the TS client in a simple SvelteKit webpage that uses the clients to show about pNodes and their stats:
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/DavidNzube101/prpc-client-example"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub Example
                </a>
                <a
                  href="https://prpc-client-example.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Live Demo
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}