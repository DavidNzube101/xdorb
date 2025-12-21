"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { PNodeMetrics } from "@/lib/api"
import { Server, MapPin, Hash } from "lucide-react"

interface SearchPaletteProps {
  nodes: PNodeMetrics[]
  open: boolean
  setOpen: (open: boolean) => void
}

export function SearchPalette({ nodes, open, setOpen }: SearchPaletteProps) {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search by name, location, or node ID..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="pNodes">
          {nodes.map((node) => (
            <CommandItem
              key={node.id}
              value={`${node.name} ${node.location} ${node.id}`}
              onSelect={() => {
                runCommand(() => router.push(`/pnodes/${node.id}`))
              }}
              className="flex flex-col items-start gap-1"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{node.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                <MapPin className="w-3 h-3" />
                <span>{node.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6 font-mono">
                <Hash className="w-3 h-3" />
                <span className="truncate">{node.id}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
