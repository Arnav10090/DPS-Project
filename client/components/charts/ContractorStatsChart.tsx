import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Alpha", issued: 40, returned: 24, time: 12 },
  { name: "Beta", issued: 30, returned: 13, time: 18 },
  { name: "Gamma", issued: 20, returned: 8, time: 10 },
  { name: "Delta", issued: 27, returned: 10, time: 22 },
  { name: "Epsilon", issued: 18, returned: 6, time: 8 },
];

export default function ContractorStatsChart() {
  return (
    <div className="w-full h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={{ value: "X axis - Different contractor name", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: "Y axis - Permits issued qty, Permits returned qty time qty", angle: -90, position: "insideLeft", offset: 30 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="issued" name="Permits issued qty" fill="#1976d2" radius={[4, 4, 0, 0]} />
          <Bar dataKey="returned" name="Permits returned qty" fill="#4caf50" radius={[4, 4, 0, 0]} />
          <Bar dataKey="time" name="Permits returned on time" fill="#ff9800" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
