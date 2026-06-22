import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function FederatedDashboard() {
  const [flState, setFlState] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFLStatus = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/federated/status');
      setFlState(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Aggregation router delayed:", err);
    }
  };

  useEffect(() => {
    fetchFLStatus();
    const ticker = setInterval(fetchFLStatus, 3000); // Polling every 3s
    return () => clearInterval(ticker);
  }, []);

  if (loading) return <div className="p-8 text-xs font-mono text-zinc-500 animate-pulse">CONNECTING PROTOCOL...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 text-white bg-black min-h-screen font-sans">
      
      {/* Title block */}
      <div className="border-b border-zinc-900 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Privacy Architecture</h1>
          <p className="text-2xs text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">Federated Core Mesh Monitor</p>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] border font-mono border-emerald-900 bg-emerald-950/30 text-emerald-400">
          {flState.privacy_status}
        </span>
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-950"><p className="text-2xs text-zinc-500 font-mono">NODES ONLINE</p><h2 className="text-3xl font-light mt-1 text-vault">{flState.connected_clients} Clients</h2></Card>
        <Card className="p-4 bg-zinc-950"><p className="text-2xs text-zinc-500 font-mono">GLOBAL ROUND</p><h2 className="text-3xl font-light mt-1">{flState.current_round} / 3</h2></Card>
        <Card className="p-4 bg-zinc-950"><p className="text-2xs text-zinc-500 font-mono">AGGREGATED ACCURACY</p><h2 className="text-3xl font-light mt-1 text-emerald-400">{(flState.global_accuracy * 100).toFixed(1)}%</h2></Card>
        <Card className="p-4 bg-zinc-950"><p className="text-2xs text-zinc-500 font-mono">ALGORITHM</p><h2 className="text-3xl font-light mt-1 text-zinc-300">{flState.aggregation_strategy}</h2></Card>
      </div>

      {/* Interactive System Pipeline Topology Diagram */}
      <Card className="p-6 bg-zinc-950 border border-zinc-800">
        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers size={14} className="text-vault" /> Network Data-Flow Pipeline
        </h3>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-center text-xs font-mono p-4 border border-zinc-900 rounded-lg bg-black/60">
          <div className="p-3 border border-zinc-800 rounded bg-zinc-900/40 w-full lg:w-48"><Shield size={16} className="mx-auto mb-1 text-vault"/> <p className="font-semibold text-zinc-200">On-Device Client Log</p><span className="text-[10px] text-zinc-500">Raw Data Point Boundary</span></div>
          <span className="text-zinc-600 hidden lg:inline">→</span>
          <div className="p-3 border border-zinc-800 rounded bg-zinc-900/40 w-full lg:w-48"><Cpu size={16} className="mx-auto mb-1 text-blue-400"/> <p className="font-semibold text-zinc-200">Local Training Pass</p><span className="text-[10px] text-zinc-500">Compute Partial Gradients</span></div>
          <span className="text-zinc-600 hidden lg:inline">→</span>
          <div className="p-3 border border-zinc-800 rounded bg-zinc-900/40 w-full lg:w-48"><RefreshCw size={16} className="mx-auto mb-1 text-amber-400"/> <p className="font-semibold text-zinc-200">Weight Serialization</p><span className="text-[10px] text-zinc-500">gRPC Parameters Transport</span></div>
          <span className="text-zinc-600 hidden lg:inline">→</span>
          <div className="p-3 border border-vault/30 rounded bg-vault/5 w-full lg:w-48"><Layers size={16} className="mx-auto mb-1 text-emerald-400"/> <p className="font-semibold text-emerald-400">FedAvg Consolidation</p><span className="text-[10px] text-zinc-500">Unified Global Paradigm</span></div>
        </div>
      </Card>

      {/* Recharts Analytics Progression History Tracking */}
      {flState.history?.length > 0 && (
        <Card className="p-6 bg-zinc-950">
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4">Convergence Velocity Path</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flState.history}>
                <XAxis dataKey="round" stroke="#52525b" fontSize={10} label={{ value: 'Aggregation Round', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke="#52525b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={1.5} name="Global Convergence Accuracy" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}