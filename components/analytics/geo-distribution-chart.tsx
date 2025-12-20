"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, Cell } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import countryFlags from "@/lib/country-flag-emoji.json"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GeoData {
    country: string;
    count: number;
    avgUptime: number;
    color: string;
}

interface GeoDistributionChartProps {
    data: GeoData[];
    onFullScreen?: () => void;
}

export function GeoDistributionChart({ data, onFullScreen }: GeoDistributionChartProps) {
  const id = "pie-interactive"
  const [activeCountry, setActiveCountry] = React.useState("")

  React.useEffect(() => {
      if (activeCountry === "" && data.length > 0) {
          setActiveCountry(data[0].country)
      }
  }, [data, activeCountry])

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.country === activeCountry),
    [activeCountry, data]
  )
  const countries = React.useMemo(() => data.map((item) => item.country), [data])

  // Build Chart Config
  const chartConfig = React.useMemo(() => {
      const config: ChartConfig = {
          count: { label: "Nodes" },
      };
      data.forEach((item, index) => {
          config[item.country] = {
              label: item.country,
              color: item.color || `hsl(var(--chart-${(index % 5) + 1}))`,
          }
      })
      return config;
  }, [data])

  const getFlag = (countryName: string) => {
      if (!countryName || countryName === "-") return "🏳️";
      const found = (countryFlags as any[]).find((c: any) => 
          c.name.toLowerCase() === countryName.toLowerCase() || 
          c.code.toLowerCase() === countryName.toLowerCase() ||
          countryName.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(countryName.toLowerCase())
      );
      return found ? found.emoji : "🏳️";
  }

  if (data.length === 0) return (
      <Card className="flex flex-col h-[300px] items-center justify-center">
          <p className="text-muted-foreground">No geographical data available</p>
      </Card>
  );

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0 justify-between">
        <div className="grid gap-1">
          <CardTitle>Geographical Distribution Analysis</CardTitle>
          <CardDescription>{data.length} Unique Countries</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Select value={activeCountry} onValueChange={setActiveCountry}>
            <SelectTrigger
                className="ml-auto h-7 w-[160px] rounded-lg pl-2.5"
                aria-label="Select a value"
            >
                <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl max-h-[200px]">
                {countries.map((key) => {
                const config = chartConfig[key as keyof typeof chartConfig]
                const item = data.find(d => d.country === key);

                if (!config) {
                    return null
                }

                return (
                    <SelectItem
                    key={key}
                    value={key}
                    className="rounded-lg [&_span]:flex"
                    >
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-base">{getFlag(key)}</span>
                        {config?.label}
                    </div>
                    </SelectItem>
                )
                })}
            </SelectContent>
            </Select>
            {onFullScreen && (
                <Button variant="ghost" size="icon" onClick={onFullScreen}>
                <Expand className="h-4 w-4" />
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="country"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox && data[activeIndex]) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {data[activeIndex].count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 15}
                          className="fill-muted-foreground"
                        >
                          Nodes
                        </tspan>
                         <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 35}
                          className="fill-muted-foreground text-xs"
                        >
                          Avg Health: {data[activeIndex].avgUptime.toFixed(1)}%
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
