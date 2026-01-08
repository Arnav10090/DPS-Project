import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const raw = [
  { name: "Alpha", returnedOnTime: 92, approvalMins: 35, safetyIssues: 1 },
  { name: "Beta", returnedOnTime: 88, approvalMins: 48, safetyIssues: 3 },
  { name: "Gamma", returnedOnTime: 95, approvalMins: 28, safetyIssues: 0 },
  { name: "Delta", returnedOnTime: 76, approvalMins: 62, safetyIssues: 4 },
  { name: "Epsilon", returnedOnTime: 83, approvalMins: 44, safetyIssues: 2 },
];

export default function ContractorKpisChart() {
  const [show, setShow] = useState({ time: true, approval: true, safety: true });
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => setShow((s) => ({ ...s, time: !s.time }))}
          className={`rounded-full px-3 py-1 text-xs border transition-colors ${show.time ? "bg-[#4caf50] text-white" : "bg-white hover:bg-gray-50"}`}
          aria-pressed={show.time}
        >
          Returned on time %
        </button>
        <button
          onClick={() => setShow((s) => ({ ...s, approval: !s.approval }))}
          className={`rounded-full px-3 py-1 text-xs border transition-colors ${show.approval ? "bg-[#1976d2] text-white" : "bg-white hover:bg-gray-50"}`}
          aria-pressed={show.approval}
        >
          Time taken for approval - mins
        </button>
        <button
          onClick={() => setShow((s) => ({ ...s, safety: !s.safety }))}
          className={`rounded-full px-3 py-1 text-xs border transition-colors ${show.safety ? "bg-[#ff9800] text-white" : "bg-white hover:bg-gray-50"}`}
          aria-pressed={show.safety}
        >
          Safety issues on time
        </button>
      </div>
      <div className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={raw}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: "X axis - Different contractor name", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Y axis - KPIs", angle: -100, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            {show.time && <Line type="monotone" dataKey="returnedOnTime" name="Returned on time %" stroke="#4caf50" strokeWidth={2} dot={false} />}
            {show.approval && <Line type="monotone" dataKey="approvalMins" name="Time for approval (mins)" stroke="#1976d2" strokeWidth={2} dot={false} />}
            {show.safety && <Line type="monotone" dataKey="safetyIssues" name="Safety issues on time" stroke="#ff9800" strokeWidth={2} dot />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
