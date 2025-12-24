"use client"

import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PNodeWithCredits } from '@/app/pnodes/page'; // Re-using the type

interface CreditsCorrelationPlotProps {
  nodes: PNodeWithCredits[];
}

type CorrelationMetric = 'xdnScore' | 'uptime' | 'stake';

const metricLabels: Record<CorrelationMetric, string> = {
  xdnScore: 'XDN Score',
  uptime: 'Uptime (seconds)',
  stake: 'Stake (POL)',
};

export function CreditsCorrelationPlot({ nodes }: CreditsCorrelationPlotProps) {
  const [metric, setMetric] = useState<CorrelationMetric>('xdnScore');

  const chartData = nodes.map(node => ({
    x: node[metric],
    y: node.credits,
    z: node.stake, // for bubble size
    name: node.name,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Credits Correlation</CardTitle>
                <CardDescription>Analyzing the relationship between credits and other metrics.</CardDescription>
            </div>
            <Select value={metric} onValueChange={(value: CorrelationMetric) => setMetric(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="xdnScore">XDN Score</SelectItem>
                    <SelectItem value="uptime">Uptime</SelectItem>
                    <SelectItem value="stake">Stake</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid />
            <XAxis 
                type="number" 
                dataKey="x" 
                name={metricLabels[metric]} 
                tick={{ fontSize: 12 }}
                domain={['dataMin', 'dataMax']}
            />
            <YAxis 
                type="number" 
                dataKey="y" 
                name="Credits" 
                tick={{ fontSize: 12 }}
                domain={['dataMin', 'dataMax']}
            />
            <ZAxis type="number" dataKey="z" range={[10, 500]} name="Stake" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border p-2 rounded shadow-lg">
                      <p className="font-bold">{data.name}</p>
                      <p className="text-sm">{`${metricLabels[metric]}: ${data.x?.toLocaleString()}`}</p>
                      <p className="text-sm">{`Credits: ${data.y?.toLocaleString()}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Nodes" data={chartData} fill="var(--color-primary)" opacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
