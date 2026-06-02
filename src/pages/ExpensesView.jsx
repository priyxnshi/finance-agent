// import React from 'react';

// export default function ExpensesView() {
//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
//   const thisYear = [38200, 41500, 36800, 43200, 39600, 42380];
//   const lastYear = [35000, 38200, 34500, 40100, 37200, 39800];
//   const maxVal = Math.max(...thisYear, ...lastYear);

//   const categories = [
//     { name: 'Food & dining', amt: '₹12,400', pct: 29 },
//     { name: 'Transport', amt: '₹7,200', pct: 17 },
//     { name: 'Shopping', amt: '₹9,800', pct: 23 },
//     { name: 'Utilities', amt: '₹5,400', pct: 13 },
//     { name: 'Entertainment', amt: '₹4,200', pct: 10 },
//     { name: 'Other', amt: '₹3,380', pct: 8 },
//   ];

//   // Generates trailing calendar running blocks
//   const continuousCells = Array.from({ length: 52 * 7 }, () => Math.floor(Math.random() * 5));

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Double-width historical graph array panel */}
//         <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-[#252420] border border-zinc-200 dark:border-[#38362F] flex flex-col justify-between">
//           <div>
//             <h3 className="text-sm font-medium text-zinc-900 dark:text-[#F0EDE8]">Monthly comparison</h3>
//             <p className="text-xs text-zinc-400 dark:text-[#9B9890] mt-0.5">Last 6 months · INR</p>
//             <div className="flex gap-4 mt-3 text-xs">
//               <div className="flex items-center gap-1.5 text-zinc-600 dark:text-[#9B9890]">
//                 <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-[#F0EDE8]" /> This Year
//               </div>
//               <div className="flex items-center gap-1.5 text-zinc-600 dark:text-[#9B9890]">
//                 <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-[#4A4840]" /> Last Year
//               </div>
//             </div>
//           </div>

//           <div className="h-44 flex items-end gap-6 pt-6 border-b border-zinc-100 dark:border-[#38362F]">
//             {months.map((m, idx) => (
//               <div key={idx} className="flex-1 h-full flex items-end gap-1 relative group">
//                 <div className="bg-zinc-900 dark:bg-[#F0EDE8] w-full rounded-t-sm transition-all hover:opacity-80" style={{ height: `${(thisYear[idx] / maxVal) * 100}%` }} />
//                 <div className="bg-zinc-300 dark:bg-[#4A4840] w-full rounded-t-sm transition-all hover:opacity-80" style={{ height: `${(lastYear[idx] / maxVal) * 100}%` }} />
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between pt-2 text-[10px] font-mono text-zinc-400 dark:text-[#65635C]">
//             {months.map((m, i) => <span key={i} className="flex-1 text-center">{m}</span>)}
//           </div>
//         </div>

//         {/* Structured Category Allocation Logs */}
//         <div className="p-6 rounded-xl bg-white dark:bg-[#252420] border border-zinc-200 dark:border-[#38362F] space-y-4">
//           <div>
//             <h3 className="text-sm font-medium text-zinc-900 dark:text-[#F0EDE8]">Category Breakdown</h3>
//             <p className="text-xs text-zinc-400 dark:text-[#9B9890] mt-0.5">Current active timeline metrics</p>
//           </div>
//           <div className="space-y-3.5">
//             {categories.map((c, i) => (
//               <div key={i} className="space-y-1">
//                 <div className="flex justify-between text-xs font-medium">
//                   <span className="text-zinc-700 dark:text-[#D4D1CB]">{c.name}</span>
//                   <span className="text-zinc-900 dark:text-[#F0EDE8]">{c.amt}</span>
//                 </div>
//                 <div className="w-full bg-zinc-100 dark:bg-[#383630] h-1 rounded-full overflow-hidden">
//                   <div className="bg-zinc-900 dark:bg-[#F0EDE8] h-full" style={{ width: `${c.pct}%` }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Grid Expenditure Heatmap Array */}
//       <div className="p-6 rounded-xl bg-white dark:bg-[#252420] border border-zinc-200 dark:border-[#38362F]">
//         <div className="flex justify-between items-center mb-4">
//           <div>
//             <h3 className="text-sm font-medium text-zinc-900 dark:text-[#F0EDE8]">Spending Heatmap</h3>
//             <p className="text-xs text-zinc-400 dark:text-[#9B9890] mt-0.5">Daily run-rate tracking matrix over trailing 12-month horizon</p>
//           </div>
//           <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-[#65635C] font-mono">
//             <span>Less</span>
//             <div className="flex gap-1">
//               <div className="w-2.5 h-2.5 rounded-[1px] bg-zinc-100 dark:bg-[#2E2D29]" />
//               <div className="w-2.5 h-2.5 rounded-[1px] bg-zinc-300 dark:bg-[#3D3B33]" />
//               <div className="w-2.5 h-2.5 rounded-[1px] bg-zinc-500 dark:bg-[#5A5750]" />
//               <div className="w-2.5 h-2.5 rounded-[1px] bg-zinc-700 dark:bg-[#8A8780]" />
//               <div className="w-2.5 h-2.5 rounded-[1px] bg-zinc-900 dark:bg-[#C4C0B4]" />
//             </div>
//             <span>More</span>
//           </div>
//         </div>

//         <div className="grid grid-cols-52 gap-1 overflow-x-auto pb-2">
//           {continuousCells.map((val, i) => (
//             <div
//               key={i}
//               className={`aspect-square w-full rounded-[1px] ${
//                 val === 0 ? 'bg-zinc-100 dark:bg-[#2E2D29]' :
//                 val === 1 ? 'bg-zinc-200 dark:bg-[#3D3B33]' :
//                 val === 2 ? 'bg-zinc-400 dark:bg-[#5A5750]' :
//                 val === 3 ? 'bg-zinc-700 dark:bg-[#8A8780]' :
//                 'bg-zinc-900 dark:bg-[#C4C0B4]'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }