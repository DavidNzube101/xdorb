"use client"

import { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, PNodeMetrics } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Bookmark, Filter, Skull, LayoutGrid, List, ChevronLeft, ChevronRight, Eye, ArrowUpDown, ArrowUp, ArrowDown, Star, Lock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EngagingLoader } from "@/components/engaging-loader"
import { PriceMarquee } from "@/components/price-marquee"
import { BuyXandButton } from "@/components/buy-xand-button"
import { PNodeCard } from "@/components/pnode-card"
import { SearchPalette } from "@/components/search-palette"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 50

// Define a new type that includes credits, rank, and private status
export type PNodeWithCredits = PNodeMetrics & { 
    credits?: number;
    rank?: number;
    isPrivate?: boolean;
};

const fetcher = (url: string) => {
    const searchParams = new URLSearchParams(url.split('?')[1]);
    return apiClient.getPNodes({
        page: 1,
        limit: 1000,
        network: searchParams.get('network') || undefined,
    });
};

const creditsFetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch credits');
    }
    const data = await response.json();
    return data.pods_credits as { pod_id: string; credits: number }[];
};

const dashboardStatsFetcher = () => apiClient.getDashboardStats();

const convertBytes = (bytes: number, unit: 'TB' | 'GB' | 'MB') => {
    if (!bytes || bytes === 0) return '0.00';
    const k = 1024;
    const units = {
      'MB': k * k,
      'GB': k * k * k,
      'TB': k * k * k * k,
    };
    return (bytes / units[unit]).toFixed(2);
};

const formatUptime = (seconds: number) => {
  if (!seconds) return "0s"
  
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`
  }

  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  
  return parts.length > 0 ? parts.join(" ") : `${seconds.toFixed(0)}s`
}

export default function PNodesPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "warning">("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchOpen, setSearchOpen] = useState(false)
  const [network, setNetwork] = useState<'devnet' | 'mainnet'>('devnet');
  
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [listStorageUnit, setListStorageUnit] = useState<'TB' | 'GB' | 'MB'>('GB');
  const [timeFormat, setTimeFormat] = useState<'absolute' | 'relative'>('relative');
  const [isMobile, setIsMobile] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ field: string | null; direction: 'asc' | 'desc' | null }>({
    field: null,
    direction: null,
  });

  const { data: result, isLoading, mutate } = useSWR(`/pnodes/all?network=${network}`, fetcher)
  const { data: statsResult } = useSWR('/dashboard/stats', dashboardStatsFetcher)
  const { data: creditsData } = useSWR(`/api/credits?network=${network}`, creditsFetcher);

  useEffect(() => {
    // Determine the WebSocket URL (handle both localhost and production with secure protocol)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const defaultWsUrl = `${protocol}//${window.location.hostname === 'localhost' ? 'localhost:9000' : 'xdorb-backend.onrender.com'}/ws`;
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
    
    // Force upgrade to wss if the page is loaded over https
    if (window.location.protocol === 'https:' && wsUrl.startsWith('ws:')) {
      wsUrl = wsUrl.replace('ws:', 'wss:');
    }
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === 'pnodes_update' && Array.isArray(data.payload)) {
            // Update the SWR cache while preserving existing metadata
            mutate((prev: any) => ({
                ...prev,
                data: data.payload,
                timestamp: Date.now()
            }), false);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [mutate]);

  const handleSort = (field: string) => {
    setSortConfig(currentSort => {
      if (currentSort.field !== field) {
        return { field, direction: 'asc' };
      }
      if (currentSort.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return { field: null, direction: null };
    });
  };

  const SortIcon = ({ field }: { field: string }) => {
      if (sortConfig.field !== field || !sortConfig.direction) {
        return <ArrowUpDown className="w-3 h-3 ml-1 text-muted-foreground opacity-50" />;
      }
      return sortConfig.direction === 'asc' 
        ? <ArrowUp className="w-3 h-3 ml-1 text-primary" />
        : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const savedView = localStorage.getItem('pnode-view') as 'list' | 'grid';
    if (savedView && !isMobile) {
      setView(savedView);
    } else {
      setView('list');
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('pnode-view', view);
    }
  }, [view, isMobile]);

  const nodesWithData = useMemo(() => {
    if (!result?.data || !Array.isArray(result.data)) return [];

    // 1. Deduplicate nodes
    const uniqueNodes = [...new Map(result.data.map(node => [node.id, node])).values()];

    // 2. Create a map of ranks based on XDN score
    const rankedNodes = [...uniqueNodes].sort((a, b) => (b.xdnScore ?? 0) - (a.xdnScore ?? 0));
    const rankMap = new Map<string, number>();
    rankedNodes.forEach((node, index) => {
        rankMap.set(node.id, index + 1);
    });

    // 3. Create a map of credits
    const creditsMap = new Map<string, number>();
    if (creditsData) {
        creditsData.forEach(item => {
            creditsMap.set(item.pod_id.trim().toLowerCase(), item.credits);
        });
    }

    // 4. Combine all data
    return uniqueNodes.map((node): PNodeWithCredits => {
        const storageUsedInBytes = node.storageUsed || 0;
        const normalizedNodeId = node.id.trim().toLowerCase();
        
        const isPrivate = (node.packetsIn === 0 && node.packetsOut === 0 && node.cpuPercent === 0 && node.memoryUsed === 0);

        return {
            ...node,
            storageUsed: storageUsedInBytes,
            credits: creditsMap.get(normalizedNodeId) ?? 0,
            rank: rankMap.get(node.id),
            isPrivate: isPrivate,
            isDevnet: node.isDevnet,
            isMainnet: node.isMainnet,
        };
    });
  }, [result, creditsData]);

  const filteredPnodes = useMemo(() => {
    return nodesWithData.filter(node => {
        const statusMatch = statusFilter === 'all' || node.status === statusFilter;
        const regionMatch = regionFilter === 'all' || node.region === regionFilter;
        return statusMatch && regionMatch;
    });
  }, [nodesWithData, statusFilter, regionFilter]);

  const sortedPnodes = useMemo(() => {
    let nodes = [...filteredPnodes];
    const { field, direction } = sortConfig;

    if (!field || !direction) {
      return nodes.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return a.name.localeCompare(b.name);
      });
    }

    const numericFields = new Set(['credits', 'uptime', 'latency', 'xdnScore', 'storageUsed', 'rank']);
    const dateFields = new Set(['lastSeen']);

    const activeNodes = nodes.filter(n => n.status === 'active');
    const inactiveNodes = nodes.filter(n => n.status !== 'active');

    const sortFunction = (a: any, b: any) => {
      let valA: any = (a as any)[field];
      let valB: any = (b as any)[field];

      if (numericFields.has(field)) {
        const numA = Number(valA);
        const numB = Number(valB);
        const finalA = isNaN(numA) ? 0 : numA;
        const finalB = isNaN(numB) ? 0 : numB;
        const comparison = finalA - finalB;
        return direction === 'asc' ? comparison : -comparison;
      }

      if (dateFields.has(field)) {
        const dateA = valA ? new Date(valA).getTime() : 0;
        const dateB = valB ? new Date(valB).getTime() : 0;
        const comparison = dateA - dateB;
        return direction === 'asc' ? comparison : -comparison;
      }

      const strA = (valA?.toString() ?? '').toLowerCase();
      const strB = (valB?.toString() ?? '').toLowerCase();
      const comparison = strA.localeCompare(strB);
      return direction === 'asc' ? comparison : -comparison;
    };

    activeNodes.sort(sortFunction);
    inactiveNodes.sort(sortFunction);

    return [...activeNodes, ...inactiveNodes];
  }, [filteredPnodes, sortConfig]);

  const paginatedPnodes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedPnodes.slice(start, end);
  }, [sortedPnodes, currentPage]);

  const totalPages = Math.ceil(filteredPnodes.length / ITEMS_PER_PAGE);

  const [bookmarked, setBookmarked] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bookmarked-pnodes')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
    const [filterOpen, setFilterOpen] = useState(false)
    const [reloading, setReloading] = useState(false)
    const [registrationInfo, setRegistrationInfo] = useState<{ date: string; time: string } | null>(null)

  const handleReload = async () => {
    setReloading(true)
    try {
      await mutate()
    } catch (error) {
      console.error("Reload error:", error)
    } finally {
      setReloading(false)
    }
  }

  const fetchRegistrationInfo = async (id: string) => {
    try {
      const result = await apiClient.getPNodeRegistrationInfo(id)
      if (result.error) {
        setRegistrationInfo({ date: 'N/A', time: 'N/A' })
      } else {
        setRegistrationInfo({ date: result.data.registrationDate, time: result.data.registrationTime })
      }
    } catch (error) {
      setRegistrationInfo({ date: 'N/A', time: 'N/A' })
    }
  }

  const toggleBookmark = (nodeId: string) => {
    const newBookmarked = new Set(bookmarked)
    if (newBookmarked.has(nodeId)) {
      newBookmarked.delete(nodeId)
    } else {
      newBookmarked.add(nodeId)
    }
    setBookmarked(newBookmarked)
    localStorage.setItem('bookmarked-pnodes', JSON.stringify([...newBookmarked]))
  }

  const regions = useMemo(() => {
    if (!result?.data || !Array.isArray(result.data)) return []
    return Array.from(new Set(result.data.map(node => node.region))).filter(Boolean)
  }, [result])

  const formatLastSeen = (dateString: string) => {
    if (timeFormat === 'relative') {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    }
    return new Date(dateString).toLocaleString();
  }

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-600 dark:text-green-400"
      case "warning":
        return "bg-primary/20 text-primary"
      case "inactive":
        return "bg-red-500/20 text-red-600 dark:text-red-400"
      default:
        return ""
    }
  }

  if (isLoading && !result?.data) {
    return <EngagingLoader />
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <SearchPalette nodes={nodesWithData || []} open={searchOpen} setOpen={setSearchOpen} />
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">pNodes</h1>
                <p className="text-muted-foreground mt-1">Monitor pNodes on the Xandeum Network</p>
                
                <div className="mt-4 md:hidden flex gap-2 items-center">
                    <div className="flex-1 border border-border bg-card/50 rounded-lg p-2 h-10 flex items-center shadow-sm overflow-hidden">
                    <PriceMarquee />
                    </div>
                    <BuyXandButton />
                </div>
            </div>
          
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <Button
                    variant="outline"
                    className="relative w-full md:w-96 group justify-start text-muted-foreground"
                    onClick={() => setSearchOpen(true)}
                >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <span className="pl-7">Search nodes...</span>
                    <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>

                <div className="flex gap-2 flex-wrap w-full md:w-auto">
                    <div className="flex items-center rounded-none bg-muted p-1">
                        <Button 
                            variant={network === 'devnet' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setNetwork('devnet')}
                            className={cn("rounded-none text-[10px] uppercase font-bold", network === 'devnet' && "bg-blue-500/10 text-blue-500")}
                        >
                            Devnet
                        </Button>
                        <Button 
                            variant={network === 'mainnet' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setNetwork('mainnet')}
                            className={cn("rounded-none text-[10px] uppercase font-bold", network === 'mainnet' && "bg-purple-500/10 text-purple-500")}
                        >
                            Mainnet
                        </Button>
                    </div>
                    <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                        <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                            {(statusFilter !== "all" || regionFilter !== "all") && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {(statusFilter !== "all" ? 1 : 0) + (regionFilter !== "all" ? 1 : 0)}
                            </Badge>
                            )}
                        </Button>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Filter pNodes</DialogTitle>
                            <DialogDescription>Refine the list of nodes by status and region.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'active', 'inactive', 'warning'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                                    statusFilter === status
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-foreground border-border hover:bg-muted"
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                                ))}
                            </div>
                            </div>
                            <div className="space-y-2">
                            <Label>Region</Label>
                            <Select value={regionFilter} onValueChange={setRegionFilter}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
                                {regions.map((region) => (
                                    <SelectItem key={region} value={region}>{region}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                            setStatusFilter("all")
                            setRegionFilter("all")
                            }}>Reset</Button>
                            <Button onClick={() => setFilterOpen(false)}>Apply Filters</Button>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={() => window.location.href = '/catacombs'} variant="outline" className="group relative inline-flex items-center justify-center overflow-hidden rounded-md px-4 py-2 font-medium text-white/90 transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-[length:200%_100%] animate-gradient-x">
                                <Skull className="w-4 h-4 mr-2 transition-transform duration-300 ease-in-out group-hover:rotate-12" />
                                Catacombs
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View historical pNodes that are no longer active.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardDescription>
                                Fetched {filteredPnodes.length} nodes in {statsResult?.data?.fetchTime.toFixed(2) ?? '-'}s
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="hidden md:flex items-center gap-1 rounded-md bg-muted p-1">
                                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')}>
                                    <List className="w-4 h-4" />
                                </Button>
                                <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('grid')}>
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                                setStatusFilter("all"); setRegionFilter("all");
                                setSortConfig({ field: null, direction: null });
                            }} className="hidden md:inline">
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && paginatedPnodes.length === 0 ? (
                        <div className="flex justify-center items-center min-h-[300px]"><EngagingLoader /></div>
                    ) : view === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full" role="table">
                                <thead>
                                    <tr className="border-b border-border" role="row">
                                        <th className="text-left p-3 font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>
                                            <div className="flex items-center">Name <SortIcon field="name" /></div>
                                        </th>
                                        <th className="text-left p-3 font-semibold text-foreground">Location</th>
                                        <th className="text-left p-3 font-semibold text-foreground hidden md:table-cell">Status</th>
                                        <th className="text-left p-3 font-semibold text-foreground hidden lg:table-cell">RPC Port</th>
                                        <th className="text-left p-3 font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => handleSort('credits')}>
                                            <div className="flex items-center">Credits <SortIcon field="credits" /></div>
                                        </th>
                                        <th className="text-left p-3 font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => handleSort('uptime')}>
                                            <div className="flex items-center">Uptime <SortIcon field="uptime" /></div>
                                        </th>
                                        <th className="text-left p-3 font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => handleSort('latency')}>
                                            <div className="flex items-center">Latency <SortIcon field="latency" /></div>
                                        </th>
                                        <th className="text-left p-3 font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => handleSort('storageUsed')}>
                                            <div className="flex items-center gap-1">
                                                Storage <SortIcon field="storageUsed" />
                                                <div onClick={e => e.stopPropagation()}>
                                                    <Select onValueChange={(v: 'TB' | 'GB' | 'MB') => setListStorageUnit(v)} defaultValue={listStorageUnit}>
                                                        <SelectTrigger className="w-fit h-6 text-xs border-none bg-transparent focus:ring-0">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="MB">MB</SelectItem>
                                                            <SelectItem value="GB">GB</SelectItem>
                                                            <SelectItem value="TB">TB</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </th>
                                        <th className="text-left p-3 font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => handleSort('lastSeen')}>
                                            <div className="flex items-center gap-1">
                                                Last Seen <SortIcon field="lastSeen" />
                                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={(e) => { e.stopPropagation(); setTimeFormat(p => p === 'absolute' ? 'relative' : 'absolute') }}>
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </th>
                                        <th className="text-left p-3 font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPnodes.map((node) => (
                                    <tr key={node.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => window.location.href = `/pnodes/${node.id}`} role="row">
                                        <td className="p-3 font-medium text-foreground">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span>{node.name}</span>
                                                            {node.registered && (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Badge variant="default" className="cursor-pointer text-[10px] px-1 h-5 bg-green-600 hover:bg-green-700 rounded-none" onClick={(e) => { e.stopPropagation(); fetchRegistrationInfo(node.id) }}>Registered</Badge>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="rounded-none">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Registered Node</DialogTitle>
                                                                            <DialogDescription>This node is officially registered on the Xandeum network.</DialogDescription>
                                                                        </DialogHeader>
                                                                        <div className="py-4">
                                                                            <p>Registration Date: {registrationInfo?.date || 'Loading...'}</p>
                                                                            <p>Registration Time: {registrationInfo?.time || 'Loading...'}</p>
                                                                        </div>
                                                                        <DialogFooter>
                                                                            <a href="https://seenodes.xandeum.network/" target="_blank" rel="noopener noreferrer">
                                                                                <Button variant="link">See Xandeum's Publication</Button>
                                                                            </a>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            )}
                                                            {node.isMainnet && (
                                                                <Badge variant="outline" className="text-[10px] px-1 h-5 bg-purple-500/10 text-purple-500 border-purple-500/20 rounded-none">
                                                                    Mainnet
                                                                </Badge>
                                                            )}
                                                            {node.isDevnet && (
                                                                <Badge variant="outline" className="text-[10px] px-1 h-5 bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-none">
                                                                    Devnet
                                                                </Badge>
                                                            )}
                                                            <Badge className={cn(statusBadgeVariant(node.status), "md:hidden rounded-none")}>{node.status.charAt(0).toUpperCase() + node.status.slice(1)}</Badge>
                                                        </div>
                                                        <Badge variant="secondary" className="w-fit text-[10px] px-1 h-5 mt-1 font-mono">XDN: {node.xdnScore ? node.xdnScore.toFixed(0) : 'N/A'}</Badge>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent><p>{node.id}</p></TooltipContent>
                                            </Tooltip>
                                        </td>
                                        <td className="p-3 text-muted-foreground">{node.location}</td>
                                        <td className="p-3 hidden md:table-cell"><Badge className={cn(statusBadgeVariant(node.status))}>{node.status.charAt(0).toUpperCase() + node.status.slice(1)}</Badge></td>
                                        <td className="p-3 hidden lg:table-cell text-sm text-muted-foreground">{node.rpcPort || '-'}</td>
                                        <td className="p-3 text-muted-foreground font-mono text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-400" />
                                                {node.credits?.toLocaleString() ?? '0'}
                                            </div>
                                        </td>
                                        <td className="p-3 text-muted-foreground font-mono text-xs">{formatUptime(node.uptime)}</td>
                                        <td className="p-3 text-muted-foreground">{node.latency}ms</td>
                                        <td className="p-3 text-muted-foreground">
                                            <div className="flex flex-col gap-1 w-[140px]">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="text-xs font-mono cursor-help">{convertBytes(node.storageUsed, listStorageUnit)} / {convertBytes(node.storageCapacity, listStorageUnit)} {listStorageUnit}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="font-mono text-xs">Used: {node.storageUsed?.toLocaleString() ?? 0} Bytes</p>
                                                        <p className="font-mono text-xs">Total: {node.storageCapacity?.toLocaleString() ?? 0} Bytes</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary/70 transition-all duration-500" 
                                                        style={{ width: `${Math.min(100, (node.storageUsed / (node.storageCapacity || 1)) * 100)}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-muted-foreground text-xs">{formatLastSeen(node.lastSeen)}</td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleBookmark(node.id); }} className={bookmarked.has(node.id) ? "text-primary" : ""}>
                                                    <Bookmark className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedPnodes.map((node) => (
                                <PNodeCard key={node.id} node={node} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}
