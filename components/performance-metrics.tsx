"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

interface MetricProps {
  label: string
  value: string
  status: "good" | "warning" | "critical"
  icon?: React.ReactNode
}

const metrics: MetricProps[] = [
  { label: "Avg Response Time", value: "42ms", status: "good", icon: <Clock className="w-4 h-4" /> },
  { label: "Error Rate", value: "0.12%", status: "good", icon: <CheckCircle2 className="w-4 h-4" /> },
  { label: "Uptime", value: "99.98%", status: "good", icon: <CheckCircle2 className="w-4 h-4" /> },
  { label: "CPU Usage", value: "45%", status: "warning", icon: <AlertCircle className="w-4 h-4" /> },
]

const statusColors = {
  good: "bg-green-500/20 text-green-600 dark:text-green-400",
  warning: "bg-primary/20 text-primary",
  critical: "bg-red-500/20 text-red-600 dark:text-red-400",
}

export function PerformanceMetrics() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>System Performance</CardTitle>
        <CardDescription>Current infrastructure metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                {metric.icon && <span className={statusColors[metric.status]}>{metric.icon}</span>}
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
