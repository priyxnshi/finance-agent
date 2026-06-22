// Fixed palette so chart colors stay stable across re-renders and between
// the pie chart and bar chart for the same category. Categories beyond the
// palette length wrap around — fine in practice since most personal budgets
// have well under a dozen active categories.
const PALETTE = ['#4C8DFF', '#34C77B', '#C9A227', '#E8A53D', '#E2574C', '#9C7E1F', '#8B92A5', '#6366F1']

export function colorForCategory(categoryName, index) {
  return PALETTE[index % PALETTE.length]
}

export function withCategoryColors(categories) {
  return categories.map((c, i) => ({ ...c, color: colorForCategory(c.category, i) }))
}
