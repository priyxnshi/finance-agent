import React, { useState, useEffect } from 'react';

export default function AnomalyAlerts({ mockTransactions }) {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo transaction log if layout context is clean
  const txList = mockTransactions || [
    { id: 1, description: "Starbucks Coffee London", amount: 4.80, date: "2026-06-22T08:30:00" },
    { id: 2, description: "Github Copilot Renewal", amount: 10.00, date: "2026-06-22T12:00:00" },
    { id: 3, description: "Atm Withdrawal Out of State", amount: 1450.00, date: "2026-06-22T03:15:00" }, // Expected outlier
    { id: 4, description: "Uber Ride Transit", amount: 22.50, date: "2026-06-22T18:45:00" }
  ];

  useEffect(() => {
    fetch('http://localhost:8000/api/ml/detect-anomalies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: txList })
    })
    .then(res => res.json())
    .then(data => {
      setAnomalies(data.anomalies);
      setLoading(false);
    })
    .catch(err => console.error("Error reading anomalous sequence:", err));
  }, [mockTransactions]);

  if (loading) return <div className="p-4 text-xs font-mono text-zinc-600 animate-pulse">PARSING ISOLATION FOREST OUTLIERS...</div>;

  return (
    <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-6 text-white">
      <div className="mb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Security Layer</span>
        <h3 className="text-lg font-light tracking-tight mt-0.5">Flagged Irregularities</h3>
      </div>

      {anomalies.length === 0 ? (
        <p className="text-xs text-zinc-500 italic font-mono border border-dashed border-zinc-900 rounded-lg p-4 text-center">
          Zero high-contamination outliers flagged in current baseline array.
        </p>
      ) : (
        <div className="space-y-3">
          {anomalies.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-rose-950/50 bg-rose-950/10">
              <div>
                <p className="text-xs font-medium text-zinc-200">{item.description}</p>
                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                  {new Date(item.date).toLocaleDateString()} • Score Deviation: {item.anomaly_confidence.toFixed(3)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-medium text-rose-400">-${item.amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}