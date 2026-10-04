import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const PriceTrendChart: React.FC = () => {
  const data = [
    { day: 'Mon', price: 750 },
    { day: 'Tue', price: 720 },
    { day: 'Wed', price: 780 },
    { day: 'Thu', price: 850 },
    { day: 'Fri', price: 950 },
    { day: 'Sat', price: 1100 },
    { day: 'Sun', price: 1050 },
  ];

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E7CB58" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#E7CB58" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="day" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
          <YAxis stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#16181F', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#E7CB58', fontSize: '12px' }}
          />
          <Area type="monotone" dataKey="price" stroke="#E7CB58" fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
