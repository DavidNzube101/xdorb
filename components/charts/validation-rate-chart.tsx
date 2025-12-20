"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { region: "North America", validated: 8400, failed: 240, pending: 221 },
  { region: "Europe", validated: 3800, failed: 221, pending: 229 },
  { region: "Asia Pacific", validated: 2000, failed: 229, pending: 200 },
  { region: "South America", validated: 2390, failed: 221, pending: 200 },
  { region: "Africa", validated: 3490, failed: 300, pending: 221 },
]

export function ValidationRateChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Validation Rate by Region</CardTitle>
        <CardDescription>Transaction processing success rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="region" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="validated" fill="var(--color-secondary)" name="Validated" />
            <Bar dataKey="failed" fill="#ef4444" name="Failed" />
            <Bar dataKey="pending" fill="var(--color-primary)" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
