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
    return nodes.map(node => ({
      value: node.id,
      label: node.name,
    }))
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
