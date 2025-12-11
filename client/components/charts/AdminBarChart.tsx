import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    period: "Last 7 Days",
    userRegistrations: 12,
    roleAssignments: 8,
    systemLogins: 145,
    permissionChanges: 5,
  },
  {
    period: "Last 30 Days",
    userRegistrations: 48,
    roleAssignments: 32,
    systemLogins: 580,
    permissionChanges: 18,
  },
  {
    period: "Last 90 Days",
    userRegistrations: 126,
    roleAssignments: 89,
    systemLogins: 1650,
    permissionChanges: 45,
  },
  {
    period: "Last 6 Months",
    userRegistrations: 285,
    roleAssignments: 198,
    systemLogins: 4200,
    permissionChanges: 112,
  },
  {
    period: "Last Year",
    userRegistrations: 520,
    roleAssignments: 380,
    systemLogins: 8900,
    permissionChanges: 225,
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
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminBarChart() {
  return (
    <div className="bg-white rounded-card shadow-card">
      <div className="bg-[#f44336] text-white px-4 py-2 rounded-t-card font-medium">
        System Analytics
      </div>
      <div className="p-5">
        <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 bg-gray-200 rounded"
            aria-hidden
          />
          <span>Bar graph - hover for details</span>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#ccc" }}
              axisLine={{ stroke: "#ccc" }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#ccc" }}
              axisLine={{ stroke: "#ccc" }}
              label={{
                value: "Count",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fontSize: "12px" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="userRegistrations"
              name="User Registrations"
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="roleAssignments"
              name="Role Assignments"
              fill="#10b981"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="systemLogins"
              name="System Logins"
              fill="#f59e0b"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="permissionChanges"
              name="Permission Changes"
              fill="#8b5cf6"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}