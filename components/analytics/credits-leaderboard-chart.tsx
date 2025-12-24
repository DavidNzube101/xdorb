"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PNodeWithCredits } from '@/app/pnodes/page'; // Re-using the type

interface CreditsLeaderboardChartProps {
  nodes: PNodeWithCredits[];
}

export function CreditsLeaderboardChart({ nodes }: CreditsLeaderboardChartProps) {
  const topNodes = nodes
    .sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0))
    .slice(0, 10)
    .reverse(); // Reverse for horizontal bar chart display

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Nodes by Credits</CardTitle>
        <CardDescription>Ranking of the highest credit-earning nodes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={topNodes}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border p-2 rounded shadow-lg">
                      <p className="font-bold">{`${payload[0].payload.name}`}</p>
                      <p className="text-sm">{`Credits: ${payload[0].value?.toLocaleString()}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="credits" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
