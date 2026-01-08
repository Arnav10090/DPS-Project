import React, { useState, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

interface MergedChartData {
  period: string;
  year: number;
  month: number;
  totalPermits: number;
  permitsApproved: number;
  permitsRejected: number;
  returnedOnTime: number;
  timeForApproval: number;
  totalTimeForPermit: number;
}

type FilterOption = "last12months" | "last6months" | "last5years" | "alltime";

const RequesterMergedChart: React.FC = () => {
  const [selectedFilter, setSelectedFilter] =
    useState<FilterOption>("last12months");

  // Sample data spanning multiple years
  const allData: MergedChartData[] = [
    // 2023
    {
      period: "Jan 2023",
      year: 2023,
      month: 1,
      totalPermits: 42,
      permitsApproved: 24,
      permitsRejected: 18,
      returnedOnTime: 95,
      timeForApproval: 45,
      totalTimeForPermit: 72,
    },
    {
      period: "Feb 2023",
      year: 2023,
      month: 2,
      totalPermits: 30,
      permitsApproved: 13,
      permitsRejected: 17,
      returnedOnTime: 88,
      timeForApproval: 52,
      totalTimeForPermit: 68,
    },
    {
      period: "Mar 2023",
      year: 2023,
      month: 3,
      totalPermits: 20,
      permitsApproved: 8,
      permitsRejected: 12,
      returnedOnTime: 92,
      timeForApproval: 38,
      totalTimeForPermit: 75,
    },
    {
      period: "Apr 2023",
      year: 2023,
      month: 4,
      totalPermits: 27,
      permitsApproved: 10,
      permitsRejected: 17,
      returnedOnTime: 86,
      timeForApproval: 65,
      totalTimeForPermit: 80,
    },
    {
      period: "May 2023",
      year: 2023,
      month: 5,
      totalPermits: 18,
      permitsApproved: 6,
      permitsRejected: 12,
      returnedOnTime: 90,
      timeForApproval: 48,
      totalTimeForPermit: 70,
    },
    {
      period: "Jun 2023",
      year: 2023,
      month: 6,
      totalPermits: 35,
      permitsApproved: 15,
      permitsRejected: 20,
      returnedOnTime: 87,
      timeForApproval: 55,
      totalTimeForPermit: 78,
    },
    {
      period: "Jul 2023",
      year: 2023,
      month: 7,
      totalPermits: 28,
      permitsApproved: 12,
      permitsRejected: 16,
      returnedOnTime: 89,
      timeForApproval: 50,
      totalTimeForPermit: 73,
    },
    {
      period: "Aug 2023",
      year: 2023,
      month: 8,
      totalPermits: 32,
      permitsApproved: 14,
      permitsRejected: 18,
      returnedOnTime: 91,
      timeForApproval: 48,
      totalTimeForPermit: 71,
    },
    {
      period: "Sep 2023",
      year: 2023,
      month: 9,
      totalPermits: 25,
      permitsApproved: 9,
      permitsRejected: 16,
      returnedOnTime: 85,
      timeForApproval: 60,
      totalTimeForPermit: 82,
    },
    {
      period: "Oct 2023",
      year: 2023,
      month: 10,
      totalPermits: 38,
      permitsApproved: 18,
      permitsRejected: 20,
      returnedOnTime: 93,
      timeForApproval: 42,
      totalTimeForPermit: 68,
    },
    {
      period: "Nov 2023",
      year: 2023,
      month: 11,
      totalPermits: 29,
      permitsApproved: 11,
      permitsRejected: 18,
      returnedOnTime: 88,
      timeForApproval: 54,
      totalTimeForPermit: 76,
    },
    {
      period: "Dec 2023",
      year: 2023,
      month: 12,
      totalPermits: 41,
      permitsApproved: 20,
      permitsRejected: 21,
      returnedOnTime: 90,
      timeForApproval: 46,
      totalTimeForPermit: 74,
    },
    // 2024
    {
      period: "Jan 2024",
      year: 2024,
      month: 1,
      totalPermits: 45,
      permitsApproved: 22,
      permitsRejected: 23,
      returnedOnTime: 92,
      timeForApproval: 48,
      totalTimeForPermit: 75,
    },
    {
      period: "Feb 2024",
      year: 2024,
      month: 2,
      totalPermits: 33,
      permitsApproved: 15,
      permitsRejected: 18,
      returnedOnTime: 89,
      timeForApproval: 53,
      totalTimeForPermit: 70,
    },
    {
      period: "Mar 2024",
      year: 2024,
      month: 3,
      totalPermits: 28,
      permitsApproved: 12,
      permitsRejected: 16,
      returnedOnTime: 91,
      timeForApproval: 49,
      totalTimeForPermit: 72,
    },
    {
      period: "Apr 2024",
      year: 2024,
      month: 4,
      totalPermits: 35,
      permitsApproved: 16,
      permitsRejected: 19,
      returnedOnTime: 87,
      timeForApproval: 58,
      totalTimeForPermit: 78,
    },
    {
      period: "May 2024",
      year: 2024,
      month: 5,
      totalPermits: 26,
      permitsApproved: 10,
      permitsRejected: 16,
      returnedOnTime: 93,
      timeForApproval: 44,
      totalTimeForPermit: 68,
    },
    {
      period: "Jun 2024",
      year: 2024,
      month: 6,
      totalPermits: 39,
      permitsApproved: 18,
      permitsRejected: 21,
      returnedOnTime: 86,
      timeForApproval: 60,
      totalTimeForPermit: 80,
    },
    {
      period: "Jul 2024",
      year: 2024,
      month: 7,
      totalPermits: 30,
      permitsApproved: 13,
      permitsRejected: 17,
      returnedOnTime: 90,
      timeForApproval: 51,
      totalTimeForPermit: 74,
    },
    {
      period: "Aug 2024",
      year: 2024,
      month: 8,
      totalPermits: 36,
      permitsApproved: 17,
      permitsRejected: 19,
      returnedOnTime: 88,
      timeForApproval: 55,
      totalTimeForPermit: 77,
    },
    {
      period: "Sep 2024",
      year: 2024,
      month: 9,
      totalPermits: 27,
      permitsApproved: 11,
      permitsRejected: 16,
      returnedOnTime: 84,
      timeForApproval: 62,
      totalTimeForPermit: 83,
    },
    {
      period: "Oct 2024",
      year: 2024,
      month: 10,
      totalPermits: 42,
      permitsApproved: 20,
      permitsRejected: 22,
      returnedOnTime: 94,
      timeForApproval: 45,
      totalTimeForPermit: 71,
    },
    {
      period: "Nov 2024",
      year: 2024,
      month: 11,
      totalPermits: 31,
      permitsApproved: 13,
      permitsRejected: 18,
      returnedOnTime: 87,
      timeForApproval: 56,
      totalTimeForPermit: 78,
    },
    {
      period: "Dec 2024",
      year: 2024,
      month: 12,
      totalPermits: 44,
      permitsApproved: 21,
      permitsRejected: 23,
      returnedOnTime: 91,
      timeForApproval: 47,
      totalTimeForPermit: 75,
    },
  ];

  const filteredData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (selectedFilter) {
      case "last6months":
        return allData.filter((item) => {
          const itemDate = new Date(item.year, item.month - 1);
          const sixMonthsAgo = new Date(currentYear, currentMonth - 6);
          return itemDate >= sixMonthsAgo;
        });
      case "last5years":
        return allData.filter((item) => {
          const fiveYearsAgo = currentYear - 5;
          return item.year >= fiveYearsAgo;
        });
      case "alltime":
        return allData;
      case "last12months":
      default:
        return allData.slice(-12);
    }
  }, [selectedFilter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes("%") ? "%" : entry.name.includes("time") && !entry.name.includes("Total time") ? " mins" : entry.name.includes("Total time") ? " hours" : ""}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getYAxisLabel = () => {
    if (selectedFilter === "alltime") {
      return "Y axis - Values (Various Years)";
    } else if (selectedFilter === "last5years") {
      return `Y axis - Values (2019-${new Date().getFullYear()})`;
    } else {
      return `Y axis - Values (${new Date().getFullYear()})`;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Requester Statistics</h2>
      </div>

      <div className="p-6">
        {/* Filter Buttons and Legend */}
        <div className="mb-6 flex items-center justify-between gap-3">
          {/* Filter Buttons - Left Side */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedFilter === "last12months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("last12months")}
              className={
                selectedFilter === "last12months"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : ""
              }
            >
              Last 12 Months
            </Button>
            <Button
              variant={selectedFilter === "last6months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("last6months")}
              className={
                selectedFilter === "last6months"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : ""
              }
            >
              Last 6 Months
            </Button>
            <Button
              variant={selectedFilter === "last5years" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("last5years")}
              className={
                selectedFilter === "last5years"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : ""
              }
            >
              Last 5 Years
            </Button>
            <Button
              variant={selectedFilter === "alltime" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("alltime")}
              className={
                selectedFilter === "alltime"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : ""
              }
            >
              All Time
            </Button>
          </div>

          {/* Legend - Right Side */}
          <div className="flex flex-wrap gap-4 justify-end text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }} />
              <span>totalPermits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#10b981" }} />
              <span>permitsApproved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f59e0b" }} />
              <span>permitsRejected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3" style={{ borderTop: "2px solid #8b5cf6" }} />
              <span>Returned on time %</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3" style={{ borderTop: "2px solid #ec4899" }} />
              <span>Time for approval (mins)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3" style={{ borderTop: "2px solid #06b6d4" }} />
              <span>Total time for permit (hours)</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[calc(100vh-280px)]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 100, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                label={{
                  value: getYAxisLabel(),
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#666",
                  },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ display: "none" }}
                height={0}
              />

              {/* Bar Charts */}
              <Bar
                dataKey="totalPermits"
                fill="#3b82f6"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="permitsApproved"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="permitsRejected"
                fill="#f59e0b"
                radius={[2, 2, 0, 0]}
              />

              {/* Line Charts */}
              <Line
                type="monotone"
                dataKey="returnedOnTime"
                name="Returned on time %"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
                activeDot={{
                  r: 5,
                  stroke: "#8b5cf6",
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
              />
              <Line
                type="monotone"
                dataKey="timeForApproval"
                name="Time for approval (mins)"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: "#ec4899", strokeWidth: 0, r: 4 }}
                activeDot={{
                  r: 5,
                  stroke: "#ec4899",
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
              />
              <Line
                type="monotone"
                dataKey="totalTimeForPermit"
                name="Total time for permit (hours)"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: "#06b6d4", strokeWidth: 0, r: 4 }}
                activeDot={{
                  r: 5,
                  stroke: "#06b6d4",
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RequesterMergedChart;
