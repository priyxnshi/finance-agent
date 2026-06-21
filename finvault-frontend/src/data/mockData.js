// Sample data only. Replace with live API calls from Phase 2 onward.

export const balanceTrend = [
  { month: 'Jan', balance: 412000, spend: 58000 },
  { month: 'Feb', balance: 398500, spend: 61200 },
  { month: 'Mar', balance: 421300, spend: 49800 },
  { month: 'Apr', balance: 446700, spend: 53100 },
  { month: 'May', balance: 439200, spend: 67400 },
  { month: 'Jun', balance: 472800, spend: 45600 },
  { month: 'Jul', balance: 498100, spend: 51900 },
  { month: 'Aug', balance: 511400, spend: 59300 },
  { month: 'Sep', balance: 505900, spend: 62800 },
  { month: 'Oct', balance: 534200, spend: 48700 },
  { month: 'Nov', balance: 558700, spend: 55200 },
  { month: 'Dec', balance: 581300, spend: 50100 },
]

export const categoryBreakdown = [
  { name: 'Housing', value: 18400, color: '#4C8DFF' },
  { name: 'Food & Dining', value: 9600, color: '#34C77B' },
  { name: 'Transport', value: 5200, color: '#C9A227' },
  { name: 'Subscriptions', value: 2100, color: '#E8A53D' },
  { name: 'Shopping', value: 6800, color: '#E2574C' },
  { name: 'Other', value: 3400, color: '#8B92A5' },
]

export const transactions = [
  { id: 'TX-9081', merchant: 'Blue Tokai Coffee', category: 'Food & Dining', date: '2026-06-19', amount: -480, status: 'Cleared' },
  { id: 'TX-9080', merchant: 'Salary — Quantum Labs', category: 'Income', date: '2026-06-18', amount: 142000, status: 'Cleared' },
  { id: 'TX-9079', merchant: 'Amazon', category: 'Shopping', date: '2026-06-17', amount: -2340, status: 'Cleared' },
  { id: 'TX-9078', merchant: 'Indigo Airlines', category: 'Travel', date: '2026-06-16', amount: -8900, status: 'Pending' },
  { id: 'TX-9077', merchant: 'Netflix', category: 'Subscriptions', date: '2026-06-15', amount: -649, status: 'Cleared' },
  { id: 'TX-9076', merchant: 'HDFC Mutual Fund SIP', category: 'Investment', date: '2026-06-14', amount: -15000, status: 'Cleared' },
  { id: 'TX-9075', merchant: 'Uber', category: 'Transport', date: '2026-06-13', amount: -310, status: 'Cleared' },
  { id: 'TX-9074', merchant: 'Society Maintenance', category: 'Housing', date: '2026-06-12', amount: -4200, status: 'Cleared' },
  { id: 'TX-9073', merchant: 'BigBasket', category: 'Food & Dining', date: '2026-06-11', amount: -1860, status: 'Cleared' },
  { id: 'TX-9072', merchant: 'Spotify', category: 'Subscriptions', date: '2026-06-10', amount: -119, status: 'Cleared' },
]

export const goals = [
  { id: 1, name: 'Emergency Fund', target: 300000, current: 214500, deadline: 'Dec 2026', color: 'signal-green' },
  { id: 2, name: 'Japan Trip', target: 180000, current: 96200, deadline: 'Mar 2027', color: 'signal-blue' },
  { id: 3, name: 'New MacBook', target: 160000, current: 142000, deadline: 'Aug 2026', color: 'vault' },
  { id: 4, name: 'Down Payment Fund', target: 1200000, current: 318000, deadline: 'Jun 2028', color: 'signal-amber' },
]

export const heatmapData = (() => {
  const days = []
  const start = new Date(2026, 0, 1)
  for (let i = 0; i < 365; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const intensity = Math.floor(Math.random() * 5)
    days.push({ date: d.toISOString().slice(0, 10), intensity })
  }
  return days
})()

export const aiInsights = [
  {
    id: 1,
    tone: 'positive',
    title: 'Savings rate up 12% this quarter',
    body: 'Your average monthly savings rate climbed from 24% to 36%, driven mainly by lower discretionary spend in Shopping.',
  },
  {
    id: 2,
    tone: 'warning',
    title: 'Subscriptions creeping up',
    body: '3 new recurring charges appeared in the last 60 days, adding ₹847/month. Review the Subscriptions category for overlap.',
  },
  {
    id: 3,
    tone: 'neutral',
    title: 'On track for Japan Trip goal',
    body: 'At your current contribution rate, this goal will be fully funded by February 2027 — a month ahead of schedule.',
  },
]

export const flClients = [
  { id: 'client-01', label: 'Device — Pixel 9', status: 'Training', accuracy: 0.912, lastRound: 14 },
  { id: 'client-02', label: 'Device — MacBook Air', status: 'Idle', accuracy: 0.927, lastRound: 14 },
  { id: 'client-03', label: 'Device — iPhone 16', status: 'Aggregating', accuracy: 0.901, lastRound: 13 },
  { id: 'client-04', label: 'Device — ThinkPad X1', status: 'Training', accuracy: 0.918, lastRound: 14 },
  { id: 'client-05', label: 'Device — Galaxy Tab', status: 'Offline', accuracy: 0.889, lastRound: 11 },
]

export const flRounds = [
  { round: 1, accuracy: 0.71 },
  { round: 2, accuracy: 0.76 },
  { round: 3, accuracy: 0.79 },
  { round: 4, accuracy: 0.81 },
  { round: 5, accuracy: 0.84 },
  { round: 6, accuracy: 0.85 },
  { round: 7, accuracy: 0.87 },
  { round: 8, accuracy: 0.885 },
  { round: 9, accuracy: 0.897 },
  { round: 10, accuracy: 0.903 },
  { round: 11, accuracy: 0.908 },
  { round: 12, accuracy: 0.912 },
  { round: 13, accuracy: 0.915 },
  { round: 14, accuracy: 0.918 },
]
