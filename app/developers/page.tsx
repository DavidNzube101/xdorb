"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useState } from "react"
import { apiClient } from "@/lib/api"
import { Wallet, Copy, Check, Terminal, Lock, Globe, AlertCircle, BookOpen } from "lucide-react"

export default function DevelopersPage() {
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerateKey = async () => {
    if (!connected || !publicKey) return
    setLoading(true)
    try {
        const result = await apiClient.generateAPIKey(publicKey.toBase58())
        if (result.error) {
            alert(result.error)
        } else if (result.data) {
            setApiKey(result.data.apiKey)
        }
    } catch (err) {
        alert("Failed to generate key")
    } finally {
        setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
        <div>
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <img src="/Logo.png" alt="XDOrb" className="w-10 h-10 rounded-full" />
                    <h1 className="text-3xl font-bold">XDOrb Developers</h1>
                </div>
                <a href="/developers/docs">
                    <Button variant="outline" className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        View API Documentation
                    </Button>
                </a>
            </div>
            <p className="text-muted-foreground">Build powerful applications on top of the Xandeum Network data.</p>
        </div>

        {/* API Key Generation */}
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Authentication
                </CardTitle>
                <CardDescription>
                    Connect your wallet to generate a unique API key. This key provides access to gated endpoints.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!connected ? (
                    <Button onClick={() => setVisible(true)}>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet to Access
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono text-sm">{publicKey?.toBase58()}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => disconnect()}>Disconnect</Button>
                        </div>

                        {!apiKey ? (
                            <Button onClick={handleGenerateKey} disabled={loading}>
                                {loading ? "Generating..." : "Generate API Key"}
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <div className="p-4 bg-background border border-green-500/50 rounded-lg">
                                    <p className="text-sm text-green-500 font-medium mb-2">API Key Generated Successfully!</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-muted p-2 rounded font-mono text-sm break-all">
                                            {apiKey}
                                        </code>
                                        <Button size="icon" variant="ghost" onClick={copyToClipboard}>
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        <AlertCircle className="w-3 h-3 inline mr-1" />
                                        Store this key safely. It will not be shown again.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Documentation */}
        <div className="grid gap-6">
            <h2 className="text-2xl font-bold">Endpoints</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
                {/* Free Tier */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-green-500" />
                        <h3 className="text-xl font-semibold">Free Tier</h3>
                    </div>
                    
                    <EndpointCard 
                        method="GET" 
                        path="/v1/get-all-pnodes" 
                        description="Retrieve a list of all active pNodes on the network." 
                    />
                    <EndpointCard 
                        method="GET" 
                        path="/v1/pnode/{id}" 
                        description="Get detailed metrics and status for a specific pNode." 
                    />
                </div>

                {/* Gated Tier */}
                <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-xl font-semibold">Gated Tier</h3>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">API Key Required</Badge>
                    </div>

                    <EndpointCard 
                        method="GET" 
                        path="/v1/analytics" 
                        description="Comprehensive network performance and growth analytics." 
                        isLocked
                    />
                    <EndpointCard 
                        method="GET" 
                        path="/v1/network" 
                        description="Global distribution map of all active nodes." 
                        isLocked
                    />
                    <EndpointCard 
                        method="GET" 
                        path="/v1/network/{region}" 
                        description="Filter nodes by specific geographical region." 
                        isLocked
                    />
                    <EndpointCard 
                        method="GET" 
                        path="/v1/leaderboard" 
                        description="Current rankings based on XDN Score and Credits." 
                        isLocked
                    />
                     <EndpointCard 
                        method="GET" 
                        path="/v1/leaderboard/{season}" 
                        description="Historical top 3 nodes for a specific season." 
                        isLocked
                    />
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function EndpointCard({ method, path, description, isLocked }: { method: string, path: string, description: string, isLocked?: boolean }) {
    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <Badge variant={method === 'GET' ? 'default' : 'secondary'}>{method}</Badge>
                    {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono block mb-2">{path}</code>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
        </Card>
    )
}
