"use client"

import * as React from "react"
import { Combobox } from "@/components/ui/combobox"
import { PNodeMetrics } from "@/lib/api"

interface SearchableNodeSelectProps {
  nodes: PNodeMetrics[]
  selectedNode?: PNodeMetrics
  onSelect: (node: PNodeMetrics | undefined) => void
  placeholder?: string
}

export function SearchableNodeSelect({
  nodes,
  selectedNode,
  onSelect,
  placeholder = "Select a node...",
}: SearchableNodeSelectProps) {
  const options = React.useMemo(() => {
    // Deduplicate nodes by ID to prevent duplicate key errors
    const uniqueMap = new Map<string, { value: string; label: string }>();
    nodes.forEach(node => {
      if (!uniqueMap.has(node.id)) {
        uniqueMap.set(node.id, {
          value: node.id,
          label: node.name,
        });
      }
    });
    return Array.from(uniqueMap.values());
  }, [nodes])

  const handleSelect = (value: string) => {
    const node = nodes.find(n => n.id === value)
    onSelect(node)
  }

  return (
    <Combobox
      options={options}
      value={selectedNode?.id}
      onChange={handleSelect}
      placeholder={placeholder}
      searchPlaceholder="Search by name or ID..."
      emptyPlaceholder="No nodes found."
      className="w-full"
    />
  )
}
