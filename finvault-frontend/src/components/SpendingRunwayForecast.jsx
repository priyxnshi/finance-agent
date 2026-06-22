import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SpendingRunwayForecast({ historicalSpend = [45, 50, 12, 85, 34, 90, 65, 40, 55, 70, 60, 80, 95, 110] }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/ml/predict-spending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ historical_daily_spend: historicalSpend, forecast_days: 30 })
    })
    .then(res => res.json())
    .then(data => {
      // Format array for Recharts mapping
      const formatted = data.daily_forecast_trendline.map((val, idx) => ({
        day: `Day ${idx + 1}`,
        Amount: val
      }));
      setForecastData({ ...data, formatted });
      setLoading(false);
    })
    .catch(err => console.error("Error fetching engine forecast:", err));
  }, [historicalSpend]);

  if (loading) return <div className="h-64 border border-zinc-900 bg-black rounded-xl animate-pulse flex items-center justify-center text-xs text-zinc-600 font-mono">CALCULATING ARIMA RUNWAY...</div>;

  return (
    <div className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md rounded-xl p-6 text-white w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Predictive Intelligence</span>
          <h2 className="text-xl font-light tracking-tight mt-1">30-Day Spending Runway</h2>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs text-zinc-500 uppercase font-mono">Projected Total Outflow</p>
          <p className="text-2xl font-light text-zinc-200 mt-0.5">${forecastData.predicted_next_month_total}</p>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 border border-emerald-900 rounded mt-1 inline-block">
            {forecastData.spending_trend_status}
          </span>
        </div>
      </div>

      <div className="h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData.formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} tickCount={6} />
            <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
              labelStyle={{ color: '#a1a1aa', fontSize: '11px', fontFamily: 'monospace' }}
              itemStyle={{ color: '#ffffff', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="Amount" 
              stroke="#ffffff" 
              strokeWidth={1.2} 
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#ffffff' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}