"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A multiple line chart"

// Generate dynamic colors for subjects
const generateChartColors = (subjects: string[]) => {
  const colorVariables = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(220 70% 50%)",
    "hsl(280 60% 55%)",
    "hsl(340 75% 55%)",
    "hsl(45 90% 55%)",
    "hsl(120 60% 45%)",
  ]

  const config: ChartConfig = {}
  subjects.forEach((subject, index) => {
    config[subject] = {
      label: subject,
      color: colorVariables[index % colorVariables.length],
    }
  })

  return config
}

export function ChartLineMultiple({ data }: { data?: any[] }) {
  const chartData = data ?? []

  const subjects = Array.from(
    new Set(
      chartData.flatMap((item) =>
        Object.keys(item).filter((key) => key !== "month")
      )
    )
  )

  const chartConfig = generateChartColors(subjects)

  const calculateTrend = () => {
    if (chartData.length < 2) return { trend: 0, isUp: true }

    const latest = chartData[chartData.length - 1]
    const previous = chartData[chartData.length - 2]

    const latestAvg =
      subjects.reduce((sum, subject) => sum + (latest[subject] || 0), 0) /
      subjects.length
    const previousAvg =
      subjects.reduce((sum, subject) => sum + (previous[subject] || 0), 0) /
      subjects.length

    const trend = ((latestAvg - previousAvg) / previousAvg) * 100
    return { trend: Math.abs(trend), isUp: trend >= 0 }
  }

  const { trend, isUp } = calculateTrend()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Performance - Multiple</CardTitle>
        <CardDescription>
          {chartData.length > 0 &&
            `${chartData[0]?.month} - ${chartData[chartData.length - 1]?.month}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const parts = value.split(" ")
                return parts.length > 1
                  ? `${parts[0].slice(0, 3)} ${parts[1]}`
                  : value.slice(0, 3)
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {subjects.map((subject) => (
              <Line
                key={subject}
                dataKey={subject}
                type="monotone"
                stroke={chartConfig[subject]?.color}
                strokeWidth={2}
                dot={true}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trend > 0 ? (
                <>
                  Trending {isUp ? "up" : "down"} by {trend.toFixed(1)}%{" "}
                  <TrendingUp
                    className={`h-4 w-4 ${!isUp ? "rotate-180" : ""}`}
                  />
                </>
              ) : (
                "No trend data available"
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing performance across{" "}
              {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
