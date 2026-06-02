// import React from 'react';

// export default function InsightsView() {
//   const insights = [
//     { type: 'warn', text: 'Food & dining spending increased 14% compared to last month. Consider reviewing dining-out frequency.', timestamp: 'Detected 3 days ago', icon: '⚠️' },
//     { type: 'good', text: 'You are on track to achieve your emergency fund goal by December 2026 — 3 months ahead of schedule.', timestamp: 'Goal status · updated today', icon: '✅' },
//     { type: 'info', text: 'Weekend spending is consistently 2.3× higher than weekday spending. Fridays and Saturdays account for 38% of monthly expenditure.', timestamp: 'Pattern detected over 4 months', icon: 'ℹ️' },
//     { type: 'warn', text: 'Predicted spend for July is ₹44,200 — exceeding your self-imposed ₹43,000 budget by ₹1,200.', timestamp: 'Forecast · 78% confidence', icon: '🚨' },
//   ];

//   return (
//     <div className="space-y-3">
//       {insights.map((item, idx) => (
//         <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#252420] border border-zinc-200 dark:border-[#38362F] flex gap-4 items-start transition-all hover:bg-zinc-50 dark:hover:bg-[#2E2D29]">
//           <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-[#383630] border border-zinc-100 dark:border-[#4A4840] flex items-center justify-center text-xs shrink-0 shadow-inner">
//             {item.icon}
//           </div>
//           <div className="space-y-0.5">
//             <p className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-[#D4D1CB]">{item.text}</p>
//             <p className="text-[11px] font-mono text-zinc-400 dark:text-[#65635C]">{item.timestamp}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }