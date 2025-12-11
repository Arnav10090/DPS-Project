import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KPIData {
  period: string;
  returnedOnTime: number;
  timeForApproval: number;
  safetyIssues: number;
}

interface RequesterLineChartProps {
  data?: KPIData[];
}

const RequesterLineChart: React.FC<RequesterLineChartProps> = ({ data }) => {
  // Default sample data - will be overridden if data prop is provided
  const [defaultData] = useState<KPIData[]>([
    { period: 'Jan', returnedOnTime: 95, timeForApproval: 45, safetyIssues: 2 },
    { period: 'Feb', returnedOnTime: 88, timeForApproval: 52, safetyIssues: 1 },
    { period: 'Mar', returnedOnTime: 92, timeForApproval: 38, safetyIssues: 3 },
    { period: 'Apr', returnedOnTime: 86, timeForApproval: 65, safetyIssues: 4 },
    { period: 'May', returnedOnTime: 90, timeForApproval: 48, safetyIssues: 2 },
  ]);

  const kpiData = data || defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('%') ? '%' : entry.name.includes('mins') ? ' mins' : ''}`}
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
        <h2 className="text-lg font-semibold">Requester KPIs</h2>
      </div>

      <div className="p-6">
        {/* KPI Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
            Returned on time %
          </span>
          <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
            Time taken for approval - mins
          </span>
          <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
            Safety issues qty
          </span>
        </div>

        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpiData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                  value: 'Y axis - KPIs', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '12px', fill: '#666' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Line 
                type="monotone" 
                dataKey="returnedOnTime" 
                name="Returned on time %" 
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Line 
                type="monotone" 
                dataKey="timeForApproval" 
                name="Time for approval (mins)" 
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Line 
                type="monotone" 
                dataKey="safetyIssues" 
                name="Safety issues qty" 
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Custom Legend */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="text-xs text-gray-500 mb-2 text-center">X axis - Different time period</div>
            <div className="flex gap-4 text-xs justify-center">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Returned on time %</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Time for approval (mins)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Safety issues qty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequesterLineChart;