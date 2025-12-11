import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PermitData {
  period: string;
  totalPermits: number;
  permitsApproved: number;
  permitsRejected: number;
}

interface RequesterBarChartProps {
  data?: PermitData[];
}

const RequesterBarChart: React.FC<RequesterBarChartProps> = ({ data }) => {
  // Default sample data - will be overridden if data prop is provided
  const [defaultData] = useState<PermitData[]>([
    { period: 'Jan', totalPermits: 42, permitsApproved: 24, permitsRejected: 18 },
    { period: 'Feb', totalPermits: 30, permitsApproved: 13, permitsRejected: 17 },
    { period: 'Mar', totalPermits: 20, permitsApproved: 8, permitsRejected: 12 },
    { period: 'Apr', totalPermits: 27, permitsApproved: 10, permitsRejected: 17 },
    { period: 'May', totalPermits: 18, permitsApproved: 6, permitsRejected: 12 },
  ]);

  const permitData = data || defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Requester Statistics</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Bar graph - hover for details
          </p>
        </div>

        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={permitData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                label={{ 
                  value: 'Y axis - Permits Qty', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '12px', fill: '#666' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalPermits" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="permitsApproved" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="permitsRejected" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Custom Legend */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="text-xs text-gray-500 mb-2 text-center">X axis - Different time period</div>
            <div className="flex gap-6 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500"></div>
                <span>Total permits</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500"></div>
                <span>Permits approved</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-500"></div>
                <span>Permits rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequesterBarChart;