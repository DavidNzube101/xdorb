"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PNodeWithCredits } from '@/app/pnodes/page'; // Re-using the type

interface VersionDistributionChartProps {
  nodes: PNodeWithCredits[];
}

// Simple hash function to generate a color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export function VersionDistributionChart({ nodes }: VersionDistributionChartProps) {
  const versionCounts = nodes.reduce((acc, node) => {
    const version = node.version || "Unknown";
    acc[version] = (acc[version] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(versionCounts).map(([name, value]) => ({
    name,
    value,
    fill: stringToColor(name),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version Distribution</CardTitle>
        <CardDescription>Distribution of software versions across all nodes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border p-2 rounded shadow-lg">
                      <p className="font-bold">{`Version: ${payload[0].name}`}</p>
                      <p className="text-sm">{`Nodes: ${payload[0].value}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
