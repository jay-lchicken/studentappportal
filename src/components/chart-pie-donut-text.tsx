"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "A donut chart with text"

export function ChartPieDonutText({ homeworks }: { homeworks: any[] }) {
  const chartData = React.useMemo(() => {
    if (!homeworks || homeworks.length === 0) {
      return []
    }

    const sourceCount: { [key: string]: number } = {}
    const sourceNames: { [key: string]: string } = {}
    homeworks.forEach((hw) => {
      if (hw.class_id_link && hw.class_name) {
      }
      const source = hw.class_id_link && hw.class_name ? hw.class_id_link : hw.class_id_link ? "404abcd" : "Personal"
      if (sourceCount[source]) {
        sourceCount[source] += 1
      } else {
        sourceCount[source] = 1
        sourceNames[source] = hw.class_id_link ? hw.class_name || "404" : "Personal"
      }
    })
    const sortedSources = Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count], index) => ({
        class: sourceNames[source],
        visitors: count,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
      }))
    return sortedSources
  }, [homeworks])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      homeworks: {
        label: "Homeworks",
      },
    }

    chartData.forEach((item) => {
      config[item.class] = {
        label: item.class,
      }
    })

    return config
  }, [chartData]) satisfies ChartConfig

  const totalHomework = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [chartData])

  if (!homeworks || homeworks.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Homework by Class</CardTitle>
          <CardDescription>Distribution of homework assignments</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No homework data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Homework by Class</CardTitle>
        <CardDescription>Distribution of homework assignments</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" nameKey="class" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalHomework.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Homeworks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="class" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Top classes with most homework <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Showing homework distribution across classes</div>
      </CardFooter>
    </Card>
  )
}
