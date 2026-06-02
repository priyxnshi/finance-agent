// import React from 'react';

// export default function DashboardView() {
//   const metrics = [
//     { label: 'Total Spending', value: '₹42,380', change: '8.4%', up: false, context: 'vs last month' },
//     { label: 'Current Savings', value: '₹1,18,500', change: '12.1%', up: true, context: 'on track' },
//     { label: 'Predicted Spend', value: '₹44,200', change: 'Jul 2026', up: null, context: 'forecast' },
//     { label: 'Goal Progress', value: '71%', change: '3 months', up: true, context: 'ahead of schedule' },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {metrics.map((m, idx) => (
//           <div key={idx} className="p-5 rounded-xl bg-white dark:bg-[#252420] border border-zinc-200 dark:border-[#38362F] shadow-sm">
//             <p className="text-xs font-medium text-zinc-400 dark:text-[#9B9890] uppercase tracking-wider">{m.label}</p>
//             <p className="text-2xl font-semibold mt-2 tracking-tight text-zinc-900 dark:text-[#F0EDE8]">{m.value}</p>
//             <div className="mt-2 flex items-center gap-1.5 text-xs">
//               {m.up !== null && (
//                 <span className={`px-1.5 py-0.5 rounded font-medium ${
//                   m.up ? 'bg-emerald-500/10 text-emerald-600 dark:bg-[#064E3B] dark:text-[#34D399]' : 'bg-rose-500/10 text-rose-600 dark:bg-[#450A0A] dark:text-[#FCA5A5]'
//                 }`}>
//                   {m.up ? '↑' : '↓'} {m.change}
//                 </span>
//               )}
//               {m.up === null && (
//                 <span className="px-1.5 py-0.5 rounded font-medium bg-zinc-100 dark:bg-[#2E2D29] text-zinc-500 dark:text-[#9B9890]">
//                   {m.change}
//                 </span>
//               )}
//               <span className="text-zinc-400 dark:text-[#65635C]">{m.context}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="p-6 rounded-xl bg-white dark:bg-[#252420] border border-zinc-200 dark:border-[#38362F]">
//         <h3 className="text-sm font-medium text-zinc-400 dark:text-[#9B9890] mb-4 uppercase tracking-wider">System Activity Stream</h3>
//         <div className="space-y-3">
//           {[1, 2, 3].map((item) => (
//             <div key={item} className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-[#38362F] pb-2 last:border-none">
//               <div className="flex items-center gap-3">
//                 <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-[#F0EDE8]" />
//                 <span className="font-medium text-zinc-700 dark:text-[#D4D1CB]">Core encryption matrix handshake verification parameters completed</span>
//               </div>
//               <span className="text-zinc-400 dark:text-[#65635C] font-mono">{item * 3}m ago</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }