// import React from 'react';

// export default function FederatedView() {
//   const edgeClients = [
//     { name: 'Client A', segment: 'Student Profile Vector', accuracyDelta: '+2.1%', marker: 'bg-emerald-500' },
//     { name: 'Client B', segment: 'Office Worker Profile Vector', accuracyDelta: '+1.8%', marker: 'bg-blue-500' },
//     { name: 'Client C', segment: 'Family Asset Profile Vector', accuracyDelta: '+2.4%', marker: 'bg-amber-500' }
//   ];

//   return (
//     <div className="p-6 rounded-xl bg-white dark:bg-[#252420] border border-zinc-200 dark:border-[#38362F] space-y-6 shadow-sm">
//       <div className="flex justify-between items-center">
//         <div>
//           <h3 className="text-sm font-medium text-zinc-900 dark:text-[#F0EDE8] uppercase tracking-wider">Federated Learning</h3>
//           <p className="text-xs text-zinc-400 dark:text-[#9B9890] mt-0.5">Distributed network privacy protection layers</p>
//         </div>
//         <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold font-mono">
//           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Node Edge
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#2E2D29] border border-zinc-100 dark:border-[#383630]">
//           <p className="text-[11px] font-mono text-zinc-400 dark:text-[#65635C] uppercase">Local Target Epochs</p>
//           <p className="text-xl font-bold mt-1 text-zinc-900 dark:text-[#F0EDE8]">24 Global Rounds</p>
//         </div>
//         <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#2E2D29] border border-zinc-100 dark:border-[#383630]">
//           <p className="text-[11px] font-mono text-zinc-400 dark:text-[#65635C] uppercase">Active Matrix Clients</p>
//           <p className="text-xl font-bold mt-1 text-zinc-900 dark:text-[#F0EDE8]">3 Isolated Nodes</p>
//         </div>
//         <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#2E2D29] border border-zinc-100 dark:border-[#383630]">
//           <p className="text-[11px] font-mono text-zinc-400 dark:text-[#65635C] uppercase">Global Convergence Accuracy</p>
//           <p className="text-xl font-bold mt-1 text-zinc-900 dark:text-[#F0EDE8]">91% Metric Limit</p>
//         </div>
//       </div>

//       <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-[#38362F]">
//         <h4 className="text-xs font-semibold text-zinc-400 dark:text-[#9B9890] uppercase tracking-wider mb-2">Connected Enclave Profiles</h4>
//         {edgeClients.map((client, idx) => (
//           <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-[#383630] last:border-none">
//             <div className="flex items-center gap-3">
//               <div className={`h-2 w-2 rounded-full ${client.marker}`} />
//               <div>
//                 <p className="text-xs font-semibold text-zinc-800 dark:text-[#D4D1CB]">{client.name}</p>
//                 <p className="text-[10px] text-zinc-400 dark:text-[#65635C] font-mono">{client.segment}</p>
//               </div>
//             </div>
//             <span className="text-xs font-mono font-bold text-zinc-700 dark:text-[#F0EDE8]">{client.accuracyDelta}</span>
//           </div>
//         ))}
//       </div>

//       <div className="p-3 bg-zinc-50 dark:bg-[#2E2D29] border border-zinc-100 dark:border-[#383630] rounded-xl flex items-center gap-2.5">
//         <span className="text-xs">🛡️</span>
//         <p className="text-xs text-zinc-500 dark:text-[#9B9890] leading-relaxed">
//           Raw financial database telemetry never leaves this partition device. Only encrypted, zero-knowledge mathematical delta gradients are broadcast.
//         </p>
//       </div>
//     </div>
//   );
// }