"use client"; // Add this directive for client-side hooks

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import shadcn table components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

// Define the structure of the SSI score data
interface SsiScore {
  id: number;
  ssi_overall_score: number;
  establish_your_professional_brand: number;
  find_the_right_people: number;
  engage_with_insights: number;
  build_relationships: number;
  date_created: string; // Keep as string initially, format later
}

export default function Home() {
  const [ssiScores, setSsiScores] = useState<SsiScore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Define type for chart data
  interface ChartDataPoint {
    date: string;
    overall: number;
    brand: number;
    people: number;
    insights: number;
    relationships: number;
  }

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const fetchSsiScores = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the backend service name if running in Docker, otherwise localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        console.log(`Fetching data from: ${apiUrl}`); // Log the API URL
        const response = await fetch(`${apiUrl}/ssi`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SsiScore[] = await response.json();
        setSsiScores(data);
      } catch (e: unknown) {
        // Changed 'any' to 'unknown'
        console.error("Failed to fetch SSI scores:", e);
        let errorMessage = "An unknown error occurred";
        if (e instanceof Error) {
          // Check if e is an Error instance
          errorMessage = e.message;
        }
        setError(
          `Failed to fetch SSI scores: ${errorMessage}. Is the backend running at ${process.env.NEXT_PUBLIC_API_URL}?`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSsiScores();
  }, []); // Empty dependency array means this runs once on mount

  // Process data for charts when ssiScores changes
  useEffect(() => {
    if (ssiScores.length > 0) {
      // Sort scores by date
      const sortedScores = [...ssiScores].sort(
        (a, b) =>
          new Date(a.date_created).getTime() -
          new Date(b.date_created).getTime()
      );

      // Create chart data
      const data = sortedScores.map((score) => {
        const date = new Date(score.date_created);
        return {
          date: date.toLocaleDateString(),
          overall: score.ssi_overall_score,
          brand: score.establish_your_professional_brand,
          people: score.find_the_right_people,
          insights: score.engage_with_insights,
          relationships: score.build_relationships,
        };
      });

      setChartData(data);
    }
  }, [ssiScores]);

  // Chart configuration
  const chartConfig = {
    overall: {
      label: "Overall Score",
      color: "#2563eb", // Blue
    },
    brand: {
      label: "Professional Brand",
      color: "#16a34a", // Green
    },
    people: {
      label: "Right People",
      color: "#ea580c", // Orange
    },
    insights: {
      label: "Insights",
      color: "#8b5cf6", // Purple
    },
    relationships: {
      label: "Relationships",
      color: "#dc2626", // Red
    },
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    try {
      return new Intl.DateTimeFormat("en-US", options).format(
        new Date(dateString)
      );
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SSI Scores Dashboard</h1>
      {loading && <p>Loading scores...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          {/* Charts Section */}
          <div className="mb-8">
            {/* Overall Score Chart */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>SSI Score Growth</CardTitle>
                <CardDescription>
                  Tracking the growth of your SSI scores over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  {chartData.length > 0 && (
                    <ChartContainer config={chartConfig}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(0,0,0,0.1)"
                        />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                          width={40}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          cursor={{ strokeDasharray: "3 3" }}
                        />
                        <ChartLegend
                          content={<ChartLegendContent />}
                          verticalAlign="bottom"
                          height={36}
                        />
                        <Line
                          type="monotone"
                          dataKey="overall"
                          stroke="var(--color-overall)"
                          strokeWidth={3}
                          dot={{ r: 5, strokeWidth: 2 }}
                          activeDot={{ r: 7 }}
                          isAnimationActive={true}
                        />
                        <Line
                          type="monotone"
                          dataKey="brand"
                          stroke="var(--color-brand)"
                          strokeWidth={3}
                          dot={{ r: 5, strokeWidth: 2 }}
                          activeDot={{ r: 7 }}
                          isAnimationActive={true}
                        />
                        <Line
                          type="monotone"
                          dataKey="people"
                          stroke="var(--color-people)"
                          strokeWidth={3}
                          dot={{ r: 5, strokeWidth: 2 }}
                          activeDot={{ r: 7 }}
                          isAnimationActive={true}
                        />
                        <Line
                          type="monotone"
                          dataKey="insights"
                          stroke="var(--color-insights)"
                          strokeWidth={3}
                          dot={{ r: 5, strokeWidth: 2 }}
                          activeDot={{ r: 7 }}
                          isAnimationActive={true}
                        />
                        <Line
                          type="monotone"
                          dataKey="relationships"
                          stroke="var(--color-relationships)"
                          strokeWidth={3}
                          dot={{ r: 5, strokeWidth: 2 }}
                          activeDot={{ r: 7 }}
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ChartContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>SSI Scores Table</CardTitle>
              <CardDescription>
                A list of your recent SSI scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>People</TableHead>
                    <TableHead>Insights</TableHead>
                    <TableHead>Relationships</TableHead>
                    <TableHead className="text-right">Date Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ssiScores.length > 0 ? (
                    ssiScores.map((score) => (
                      <TableRow key={score.id}>
                        <TableCell className="font-medium">
                          {score.id}
                        </TableCell>
                        <TableCell>
                          {score.ssi_overall_score.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {score.establish_your_professional_brand.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {score.find_the_right_people.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {score.engage_with_insights.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {score.build_relationships.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDate(score.date_created)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No scores found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
