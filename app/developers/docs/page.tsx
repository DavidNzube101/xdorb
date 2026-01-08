"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useMemo } from "react"
import { Search, Terminal, Lock, Globe, Copy, Check, ChevronRight, BookOpen, Code } from "lucide-react"
import { Button } from "@/components/ui/button"

const endpoints = [
  {
    method: "GET",
    path: "/v1/get-all-pnodes",
    title: "Get All pNodes",
    description: "Returns a complete list of all active pNodes currently contributing to the Xandeum Network. This includes basic status and location data.",
    tier: "Free",
    params: [],
    response: `{
  "data": [
    {
      "id": "2NGz2GGA...",
      "name": "Arrakis-1",
      "status": "active",
      "location": "Paris, FR",
      "uptime": 99.98
    }
  ]
}`
  },
  {
    method: "GET",
    path: "/v1/pnode/{id}",
    title: "Get pNode Details",
    description: "Retrieve comprehensive metrics for a specific node, including resource usage (CPU/RAM), historical performance, and network latency.",
    tier: "Free",
    params: [{ name: "id", type: "string", description: "The public key or ID of the node" }],
    response: `{
  "data": {
    "id": "2NGz2GGA...",
    "cpuPercent": 4.5,
    "memoryUsed": 1073741824,
    "latency": 42,
    "stake": 50000
  }
}`
  },
  {
    method: "GET",
    path: "/v1/analytics",
    title: "Network Analytics",
    description: "Provides high-level insights into network growth, total storage capacity, geographic distribution, and performance trends over time.",
    tier: "Gated",
    params: [],
    response: `{
  "data": {
    "storage": { "totalCapacity": 191363533861740, "usedCapacity": 5002276492 },
    "geoDistribution": [ { "country": "France", "count": 88 } ]
  }
}`
  },
  {
    method: "GET",
    path: "/v1/network",
    title: "Network Distribution",
    description: "Returns the global distribution of nodes mapped by regions and countries, suitable for building world maps or regional dashboards.",
    tier: "Gated",
    params: [],
    response: `{
  "data": [
    { "country": "United States", "count": 43, "avgUptime": 98.5 }
  ]
}`
  },
  {
    method: "GET",
    path: "/v1/network/{region}",
    title: "Regional Node List",
    description: "Filter active nodes by a specific geographical region (e.g., 'Europe', 'North America') to analyze local performance.",
    tier: "Gated",
    params: [{ name: "region", type: "string", description: "The region name" }],
    response: `{
  "data": [ { "id": "...", "region": "Europe" } ]
}`
  },
  {
    method: "GET",
    path: "/v1/leaderboard",
    title: "Current Leaderboard",
    description: "Fetches the real-time ranking of pNodes based on their XDN Score and total credits earned in the current cycle.",
    tier: "Gated",
    params: [],
    response: `{
  "data": [ { "rank": 1, "xdnScore": 98.5, "id": "..." } ]
}`
  }
]

export default function DevDocsPage() {
  const [search, setSearch] = useState("")
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0])

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(e => 
      e.title.toLowerCase().includes(search.toLowerCase()) || 
      e.path.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const generateCode = (lang: string, endpoint: any) => {
    const baseUrl = "https://api.xdorb.xyz"
    const path = endpoint.path.replace("{id}", "2NGz2GGA...").replace("{region}", "Europe")
    const fullUrl = `${baseUrl}${path}`
    const apiKeyHeader = endpoint.tier === "Gated" ? `\n  "x-api-key": "YOUR_API_KEY"` : ""

    switch (lang) {
      case "curl":
        return `curl -X GET "${fullUrl}" ${endpoint.tier === "Gated" ? `\
  -H "x-api-key: YOUR_API_KEY"` : ""}`
      case "node":
        return `const response = await fetch("${fullUrl}", {
  headers: {
    "Content-Type": "application/json"${apiKeyHeader}
  }
});
const data = await response.json();`
      case "python":
        return `import requests

url = "${fullUrl}"
headers = {${endpoint.tier === "Gated" ? `\n    "x-api-key": "YOUR_API_KEY"` : ""}\n}

response = requests.get(url, headers=headers)
print(response.json())`
      case "go":
        return `req, _ := http.NewRequest("GET", "${fullUrl}", nil)
${endpoint.tier === "Gated" ? `req.Header.Set("x-api-key", "YOUR_API_KEY")` : ""}
resp, _ := http.DefaultClient.Do(req)`
      case "rust":
        return `let client = reqwest::blocking::Client::new();
let res = client.get("${fullUrl}")
    ${endpoint.tier === "Gated" ? `.header("x-api-key", "YOUR_API_KEY")` : ""}
    .send()?
    .json::<serde_json::Value>()?;`
      default:
        return ""
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-20 h-full">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-6">
            <div className="sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Documentation</h2>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search endpoints..." 
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <nav className="space-y-1">
                    {filteredEndpoints.map((e) => (
                        <button
                            key={e.path}
                            onClick={() => setSelectedEndpoint(e)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${selectedEndpoint.path === e.path ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
                        >
                            <span className="truncate">{e.title}</span>
                            <ChevronRight className={`w-3 h-3 ${selectedEndpoint.path === e.path ? "opacity-100" : "opacity-0"}`} />
                        </button>
                    ))}
                </nav>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
            <div className="pb-6 border-b">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant={selectedEndpoint.tier === "Free" ? "secondary" : "outline"} className={selectedEndpoint.tier === "Gated" ? "text-yellow-500 border-yellow-500" : ""}>
                        {selectedEndpoint.tier} Tier
                    </Badge>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-sm font-mono text-muted-foreground">{selectedEndpoint.method}</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">{selectedEndpoint.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    {selectedEndpoint.description}
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Specs */}
                <div className="space-y-8">
                    <section>
                        <h3 className="text-xl font-semibold mb-4">Request</h3>
                        <div className="bg-muted p-4 rounded-lg flex items-center gap-3 font-mono text-sm">
                            <Badge className="bg-blue-500">{selectedEndpoint.method}</Badge>
                            <span className="text-foreground">{selectedEndpoint.path}</span>
                        </div>
                    </section>

                    {selectedEndpoint.params.length > 0 && (
                        <section>
                            <h3 className="text-xl font-semibold mb-4">Parameters</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Name</th>
                                            <th className="px-4 py-2 font-medium">Type</th>
                                            <th className="px-4 py-2 font-medium">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {selectedEndpoint.params.map(p => (
                                            <tr key={p.name}>
                                                <td className="px-4 py-3 font-mono text-primary">{p.name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                                                <td className="px-4 py-3">{p.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    <section>
                        <h3 className="text-xl font-semibold mb-4">Authentication</h3>
                        {selectedEndpoint.tier === "Gated" ? (
                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex gap-3">
                                <Lock className="w-5 h-5 text-yellow-500 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    This endpoint requires a valid API key passed in the <code className="text-yellow-500">x-api-key</code> header. You can generate a key in the <a href="/developers" className="text-primary underline">Developer Portal</a>.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg flex gap-3">
                                <Globe className="w-5 h-5 text-green-500 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    This endpoint is public and rate-limited. No authentication is required.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right: Code Examples */}
                <div className="space-y-6">
                    <Tabs defaultValue="curl" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Code className="w-5 h-5" />
                                Usage Examples
                            </h3>
                            <TabsList>
                                <TabsTrigger value="curl">cURL</TabsTrigger>
                                <TabsTrigger value="node">Node</TabsTrigger>
                                <TabsTrigger value="python">Python</TabsTrigger>
                                <TabsTrigger value="go">Go</TabsTrigger>
                                <TabsTrigger value="rust">Rust</TabsTrigger>
                            </TabsList>
                        </div>
                        {["curl", "node", "python", "go", "rust"].map(lang => (
                            <TabsContent key={lang} value={lang}>
                                <div className="relative group">
                                    <pre className="bg-zinc-950 p-4 rounded-lg text-zinc-300 text-sm overflow-x-auto min-h-[120px] font-mono border border-zinc-800">
                                        <code>{generateCode(lang, selectedEndpoint)}</code>
                                    </pre>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => navigator.clipboard.writeText(generateCode(lang, selectedEndpoint))}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <section>
                        <h3 className="text-xl font-semibold mb-4">Sample Response</h3>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono border">
                            <code>{selectedEndpoint.response}</code>
                        </pre>
                    </section>
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
