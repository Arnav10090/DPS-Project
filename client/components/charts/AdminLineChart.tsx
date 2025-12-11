import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    period: "Week 1",
    systemUptime: 99.8,
    failedLogins: 12,
    avgResponseTime: 145,
    activeSessions: 48,
  },
  {
    period: "Week 2",
    systemUptime: 99.5,
    failedLogins: 18,
    avgResponseTime: 165,
    activeSessions: 52,
  },
  {
    period: "Week 3",
    systemUptime: 99.9,
    failedLogins: 8,
    avgResponseTime: 120,
    activeSessions: 45,
  },
  {
    period: "Week 4",
    systemUptime: 99.7,
    failedLogins: 15,
    avgResponseTime: 138,
    activeSessions: 58,
  },
  {
    period: "Week 5",
    systemUptime: 99.6,
    failedLogins: 22,
    avgResponseTime: 180,
    activeSessions: 62,
  },
  {
    period: "Week 6",
    systemUptime: 99.9,
    failedLogins: 6,
    avgResponseTime: 110,
    activeSessions: 55,
  },
  {
    period: "Week 7",
    systemUptime: 99.8,
    failedLogins: 10,
    avgResponseTime: 125,
    activeSessions: 60,
  },
  {
    period: "Week 8",
    systemUptime: 99.4,
    failedLogins: 28,
    avgResponseTime: 195,
    activeSessions: 48,
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="font-medium text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
            {entry.dataKey === "systemUptime" ? "%" : ""}
            {entry.dataKey === "avgResponseTime" ? "ms" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-[#10b981]" />
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
          System Uptime %
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-[#ef4444]" />
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
          Failed Login Attempts
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-[#3b82f6]" />
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Avg Response Time (ms)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-[#f59e0b]" />
        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
          Active Sessions
        </span>
      </div>
    </div>
  );
};

export default function AdminLineChart() {
  return (
    <div className="bg-white rounded-card shadow-card">
      <div className="bg-[#f44336] text-white px-4 py-2 rounded-t-card font-medium">
        System Performance & Security KPIs
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#ccc" }}
              axisLine={{ stroke: "#ccc" }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="percentage"
              orientation="left"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#ccc" }}
              axisLine={{ stroke: "#ccc" }}
              domain={[98, 100]}
              label={{
                value: "Uptime %",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fontSize: "12px" },
              }}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#ccc" }}
              axisLine={{ stroke: "#ccc" }}
              label={{
                value: "Count/Time",
                angle: 90,
                position: "insideRight",
                style: { textAnchor: "middle", fontSize: "12px" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="percentage"
              type="monotone"
              dataKey="systemUptime"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              name="System Uptime %"
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="failedLogins"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
              name="Failed Login Attempts"
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="avgResponseTime"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
              name="Avg Response Time (ms)"
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="activeSessions"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
              name="Active Sessions"
            />
          </LineChart>
        </ResponsiveContainer>
        <CustomLegend />
      </div>
    </div>
  );
}