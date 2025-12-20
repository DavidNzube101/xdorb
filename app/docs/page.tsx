"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Terminal, Copy } from "lucide-react"
import { useState } from "react"

const CodeBlock = ({ children }: { children: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mt-2 mb-4 group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            onClick={copyToClipboard}
            className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition-colors"
        >
            {copied ? <span className="text-xs text-green-400">Copied!</span> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="bg-black/90 p-4 rounded-lg overflow-x-auto text-sm font-mono text-green-400 border border-white/10">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export default function DocsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Setting Up XDOrb</h1>
          <p className="text-xl text-muted-foreground">
            Complete guide to spinning up your own instance of the XDOrb Analytics Platform.
          </p>
        </div>

        <div className="grid gap-6">
            {/* Prerequisites */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle>What You Need</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li><strong>Go 1.25</strong> or newer</li>
                        <li><strong>Node.js 18</strong> or newer, plus <code className="bg-muted px-1 rounded">pnpm</code></li>
                        <li>A running <strong>Redis</strong> instance</li>
                        <li>API keys for <strong>Jupiter</strong> and <strong>Google Gemini</strong></li>
                    </ul>
                </CardContent>
            </Card>

            {/* Backend Setup */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Terminal className="w-5 h-5" />
                        </div>
                        <CardTitle>Backend Setup</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        First, clone the backend repository. You'll need to configure your environment variables. 
                        Create a <code className="text-foreground bg-muted px-1 rounded">.env</code> file in the backend folder:
                    </p>

                    <CodeBlock>{`cat << EOF > .env
API_KEY="<YOUR_PRIMARY_API_KEY>" 
ENVIRONMENT="development"
FIREBASE_CLIENT_EMAIL="<FIREBASE_SERVICE_ACCOUNT_EMAIL>"
FIREBASE_PRIVATE_KEY="<FIREBASE_PRIVATE_KEY_CONTENT>"
FIREBASE_PROJECT_ID="<YOUR_FIREBASE_PROJECT_ID>"
GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>" # get from aistudio.google.com/
HISTORY_CACHE_TTL="1h"
JUPITER_API_KEY="<YOUR_JUPITER_API_KEY>" # get from portal.jup.ag/api-keys
PNODE_CACHE_TTL="2m"
PORT="9000"
PRICE_CACHE_TTL="30m"
PRPC_ENDPOINT="https://xandeum.network"
PRPC_TIMEOUT="10s"
RATE_LIMIT_RPM="100"
REDIS_DB="0"
REDIS_PASSWORD="<YOUR_REDIS_PASSWORD>"
REDIS_URL="<REDIS_HOST_AND_PORT>"
STATS_CACHE_TTL="5m"
TELEGRAM_ADMIN_PASSWORD="<ADMIN_PASSWORD_FOR_TELEGRAM_BOT>"
TELEGRAM_BOT_TOKEN="<YOUR_TELEGRAM_BOT_TOKEN>" # get from t.me/BotFather
VALID_API_KEYS="<COMMA_SEPARATED_LIST_OF_VALID_API_KEYS>"
GIN_MODE="debug"
EOF`}</CodeBlock>

                    <p className="text-muted-foreground mt-4">
                        Once your .env file is ready, run the following command to clean modules, download the IP database, build, and start the server:
                    </p>

                    <CodeBlock>{`go mod tidy && curl -L "https://github.com/DavidNzube101/xdorb-backend/releases/download/v1.0-db/IP2LOCATION-LITE-DB11.IPV6.BIN" -o location-db/IP2LOCATION-LITE-DB11.IPV6.BIN && go build -tags netgo -ldflags '-s -w' -o server ./cmd/server && ./server`}</CodeBlock>
                    
                    <div className="flex items-center gap-2 text-sm text-green-500 mt-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Server should start on port 9000
                    </div>
                </CardContent>
            </Card>

            {/* UI Setup */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <Terminal className="w-5 h-5" />
                        </div>
                        <CardTitle>UI Setup</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Navigate to the frontend directory. Create a <code className="text-foreground bg-muted px-1 rounded">.env</code> file:
                    </p>

                    <CodeBlock>{`cat << EOF > .env
NODE_ENV=development
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
API_BASE=http://localhost:9000 # Backend URL
API_KEY=<API_KEY_FROM_BACKEND>

# Client-side variables
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EOF`}</CodeBlock>

                    <p className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded border border-amber-500/20">
                        <strong>Note:</strong> The <code className="font-mono">API_KEY</code> must match one of the keys in <code className="font-mono">VALID_API_KEYS</code> from your backend configuration.
                    </p>

                    <p className="text-muted-foreground mt-4">
                        Install dependencies, build, and start the application:
                    </p>

                    <CodeBlock>pnpm i && pnpm build && pnpm start</CodeBlock>

                    <div className="flex items-center gap-2 text-sm text-green-500 mt-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        UI running at http://localhost:3000
                    </div>
                </CardContent>
            </Card>

            {/* Usage Guide */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle>Using XDOrb</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                            <h3 className="font-bold mb-2 text-primary">Viewing pNodes</h3>
                            <p className="text-sm text-muted-foreground">
                                Head to the pNodes dashboard to see all network nodes. Use search and filters to find specific validators or regions.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                            <h3 className="font-bold mb-2 text-primary">AI Insights</h3>
                            <p className="text-sm text-muted-foreground">
                                Check the Intelligent Network Summary for an overview, or select two nodes to run a detailed AI comparison.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                            <h3 className="font-bold mb-2 text-primary">Trading Terminal</h3>
                            <p className="text-sm text-muted-foreground">
                                Open the full-screen terminal to view live charts and swap tokens via Jupiter integration.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                            <h3 className="font-bold mb-2 text-primary">Live Analytics</h3>
                            <p className="text-sm text-muted-foreground">
                                Visit the Analytics page for real-time visualizations of network health, storage, and throughput.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
