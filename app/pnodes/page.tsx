"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import Papa from "papaparse"
import jsPDF from 'jspdf'
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Download, FileText, FileSpreadsheet, Bookmark, Share2, ChevronLeft, ChevronRight, Eye, Info, RotateCcw, RefreshCw, Filter } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { PriceMarquee } from "@/components/price-marquee"
import { BuyXandButton } from "@/components/buy-xand-button"

const fetcher = async () => {
  const result = await apiClient.getPNodes()
  if (result.error) throw new Error(result.error)
  return result.data
}

export default function PNodesPage() {
  const { data: pnodes, isLoading, mutate } = useSWR("/pnodes", fetcher, { refreshInterval: 30000 })
  const fetchPNodes = () => mutate()

  const [search, setSearch] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "warning">("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [bookmarked, setBookmarked] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bookmarked-pnodes')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
   const [previewOpen, setPreviewOpen] = useState(false)
   const [filterOpen, setFilterOpen] = useState(false)
   const [reloading, setReloading] = useState(false)

  const handleReload = async () => {
    setReloading(true)
    try {
      const result = await apiClient.refreshData()
      if (result.error) {
        console.error("Reload failed:", result.error)
      } else {
        mutate(result.data, false)
        setStatusFilter("all")
        setRegionFilter("all")
        setSearch("")
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Reload error:", error)
    } finally {
      setReloading(false)
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

  const shareNode = (node: any) => {
    if (navigator.share) {
      navigator.share({
        title: `pNode: ${node.name}`,
        text: `Check out this pNode: ${node.name} in ${node.location}`,
        url: `${window.location.origin}/pnodes/${node.id}`,
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/pnodes/${node.id}`)
    }
  }

  const filtered = Array.isArray(pnodes)
    ? pnodes.filter((node) => {
        const matchesSearch =
          node.name.toLowerCase().includes(search.toLowerCase()) ||
          node.location.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === "all" || node.status === statusFilter
        const matchesRegion = regionFilter === "all" || node.region === regionFilter
        return matchesSearch && matchesStatus && matchesRegion
      })
    : []

  const regions = Array.isArray(pnodes)
    ? Array.from(new Set(pnodes.map(node => node.region))).filter(Boolean)
    : []

  // Search Suggestions Logic
  const suggestions = useMemo(() => {
    if (!search || search.length < 2 || !pnodes) return []
    const lowerSearch = search.toLowerCase()
    const matches = new Set<string>()
    pnodes.forEach(node => {
      if (node.name.toLowerCase().includes(lowerSearch)) matches.add(node.name)
      if (node.location.toLowerCase().includes(lowerSearch)) matches.add(node.location)
    })
    return Array.from(matches).slice(0, 5) // Top 5 suggestions
  }, [search, pnodes])

  // Pagination
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNodes = filtered?.slice(startIndex, startIndex + itemsPerPage) || []

  const exportToCSV = () => {
    if (!filtered) return

    const csvData = filtered.map(node => ({
      Name: node.name,
      Location: node.location,
      Status: node.status,
      Uptime: `${node.uptime}%`,
      Latency: `${node.latency}ms`,
      Validations: node.validations,
      Rewards: node.rewards.toFixed(2),
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'pnodes-data.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = async () => {
    if (!filtered) return

    try {
      const doc = new jsPDF()
      doc.setFontSize(20)
      doc.text('pNodes Directory', 20, 30)

      const headers = ['Name', 'Location', 'Status', 'Uptime', 'Latency', 'Validations', 'Rewards']
      const data = filtered.map(node => [
        node.name,
        node.location,
        node.status,
        `${node.uptime}%`,
        `${node.latency}ms`,
        node.validations.toString(),
        node.rewards.toFixed(2)
      ])

      let yPosition = 50
      const pageHeight = doc.internal.pageSize.height
      const lineHeight = 8
      const margin = 20
      const columnWidth = (doc.internal.pageSize.width - 2 * margin) / headers.length

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, index) => {
        doc.text(header, margin + index * columnWidth, yPosition)
      })

      yPosition += lineHeight
      doc.line(margin, yPosition - 2, doc.internal.pageSize.width - margin, yPosition - 2)
      yPosition += lineHeight / 2

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)

      data.forEach((row, rowIndex) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = 30
        }

        row.forEach((cell, cellIndex) => {
          const cellText = cell.toString()
          const maxChars = Math.floor((columnWidth - 4) / 2)
          const truncatedText = cellText.length > maxChars
            ? cellText.substring(0, maxChars - 3) + '...'
            : cellText

          doc.text(truncatedText, margin + cellIndex * columnWidth, yPosition)
        })

        yPosition += lineHeight

        if (rowIndex % 2 === 0) {
          doc.setDrawColor(240, 240, 240)
          doc.line(margin, yPosition - lineHeight + 2, doc.internal.pageSize.width - margin, yPosition - lineHeight + 2)
          doc.setDrawColor(0, 0, 0)
        }
      })

      doc.save('pnodes-data.pdf')
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF export failed. Please try again.')
    }
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

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">pNodes</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor all pNodes on the Xandeum Network</p>
                    
                    {/* Mobile Price Marquee & Buy Button */}
                    <div className="mt-4 md:hidden flex gap-2 items-center">
                      <div className="flex-1 border border-border bg-card/50 rounded-lg p-2 h-10 flex items-center shadow-sm overflow-hidden">
                        <PriceMarquee />
                      </div>
                      <BuyXandButton />
                    </div>
                  </div>
          
          {/* Toolbar: Search (Left) | Actions (Right) */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            {/* Intelligent Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search nodes by name or location..."
                className="pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                aria-label="Search pNodes"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                  <ul>
                    {suggestions.map((s, i) => (
                      <li 
                        key={i}
                        className="px-4 py-2 text-sm hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => {
                          setSearch(s)
                          setShowSuggestions(false)
                        }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              {/* Filters Modal */}
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
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter pNodes</DialogTitle>
                    <DialogDescription>Refine the list of nodes by status and region.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex flex-wrap gap-2">
                        {(["all", "active", "inactive", "warning"] as const).map((status) => (
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

              <Button onClick={exportToCSV} variant="outline" size="icon" title="Export CSV">
                <FileSpreadsheet className="w-4 h-4" />
              </Button>
              
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Preview PDF">
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle>PDF Preview - pNodes Directory</DialogTitle>
                      <DialogDescription>
                        Review the data before exporting to PDF
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-white text-black p-4 rounded border min-h-0">
                      <h1 className="text-xl font-bold mb-4 text-black">pNodes Directory</h1>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm" id="pdf-preview-table">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Uptime</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Latency</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Validations</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Rewards</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered?.map((node, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-4 py-2">{node.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{node.location}</td>
                                <td className="border border-gray-300 px-4 py-2">{node.status}</td>
                                <td className="border border-gray-300 px-4 py-2">{node.uptime}%</td>
                                <td className="border border-gray-300 px-4 py-2">{node.latency}ms</td>
                                <td className="border border-gray-300 px-4 py-2">{node.validations}</td>
                                <td className="border border-gray-300 px-4 py-2">{node.rewards.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 flex-shrink-0">
                      <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => { exportToPDF(); setPreviewOpen(false); }}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Nodes Table */}
          <Card className="border-border bg-card">
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle>Active Nodes</CardTitle>
                   <CardDescription>{filtered?.length || 0} nodes found</CardDescription>
                 </div>
                 <div className="flex gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={handleReload}
                     disabled={reloading}
                     className="gap-2 bg-[#116b61] text-white hover:bg-[#116b61]/90"
                   >
                     <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
                     <span className="hidden sm:inline">
                       {reloading ? 'Reloading...' : 'Pull Fresh Data'}
                     </span>
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => {
                     setStatusFilter("all")
                     setRegionFilter("all")
                     setSearch("")
                     setCurrentPage(1)
                   }}>
                     Clear Filters
                   </Button>
                 </div>
               </div>
             </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full" role="table" aria-label="pNodes data table">
                     <thead>
                       <tr className="border-b border-border" role="row">
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Name</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Location</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Status</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Uptime</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Latency</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Storage</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Last Seen</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Validations</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Rewards</th>
                         <th className="text-left p-3 font-semibold text-foreground" role="columnheader" aria-sort="none">Actions</th>
                        </tr>
                      </thead>
                     <tbody>
                        {paginatedNodes.map((node) => (
                          <tr
                            key={node.id}
                            className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/pnodes/${node.id}`}
                            role="row"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                window.location.href = `/pnodes/${node.id}`
                              }
                            }}
                            aria-label={`pNode ${node.name}, status ${node.status}, uptime ${node.uptime}%`}
                          >
                            <td className="p-3 font-medium text-foreground" role="cell">
                                <div className="flex flex-col">
                                    <span>{node.name}</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="secondary" className="w-fit text-[10px] px-1 h-5 cursor-help mt-1 font-mono">
                                                XDN: {node.xdnScore ? node.xdnScore.toFixed(0) : 'N/A'}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs">
                                            <div className="space-y-2 p-1">
                                                <p className="font-semibold text-xs border-b pb-1 mb-1">XDN Score Formula</p>
                                                <ul className="text-[10px] space-y-1 text-muted-foreground">
                                                    <li className="flex justify-between"><span>Stake:</span> <span>40%</span></li>
                                                    <li className="flex justify-between"><span>Uptime:</span> <span>30%</span></li>
                                                    <li className="flex justify-between"><span>Latency:</span> <span>20%</span></li>
                                                    <li className="flex justify-between"><span>Risk Score:</span> <span>10%</span></li>
                                                </ul>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </td>
                            <td className="p-3 text-muted-foreground" role="cell">{node.location}</td>
                            <td className="p-3" role="cell">
                              <Badge className={statusBadgeVariant(node.status)}>
                                {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground" role="cell">{node.uptime}%</td>
                            <td className="p-3 text-muted-foreground" role="cell">{node.latency}ms</td>
                            <td className="p-3 text-muted-foreground" role="cell">
                              {(node.storageUsed / 1024).toFixed(1)} / {(node.storageCapacity / 1024).toFixed(1)} TB
                            </td>
                            <td className="p-3 text-muted-foreground" role="cell">
                              {new Date(node.lastSeen).toLocaleString()}
                            </td>
                            <td className="p-3 text-muted-foreground" role="cell">{node.validations}</td>
                            <td className="p-3 font-semibold text-foreground" role="cell">{node.rewards.toFixed(2)}</td>
                            <td className="p-3" role="cell">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBookmark(node.id)
                                  }}
                                  className={bookmarked.has(node.id) ? "text-primary" : ""}
                                  aria-label={bookmarked.has(node.id) ? "Remove bookmark" : "Add bookmark"}
                                >
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    shareNode(node)
                                  }}
                                  aria-label="Share pNode"
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

           {/* Pagination */}
           {totalPages > 1 && (
         <div className="flex items-center justify-between">
           <div className="flex gap-2">
             <Button
               variant="outline"
               size="sm"
               onClick={() => window.location.reload()}
               className="gap-2"
             >
               <RotateCcw className="w-4 h-4" />
               Hard Reload
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={fetchPNodes}
               disabled={isLoading}
               className="gap-2"
             >
               <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
               Refresh
             </Button>
           </div>
         </div>
           )}
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}