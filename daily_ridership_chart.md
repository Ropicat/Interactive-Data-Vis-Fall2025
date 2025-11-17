## Daily Combined Ridership Chart

This chart shows the combined total ridership of all stations for each day.

```js
// Aggregate ridership data by date - sum all stations' ridership for each day
const dailyCombinedRidership = Array.from(
  d3.group(incidents_ridership_events_combined, d => d.date),
  ([date, records]) => ({
    date: new Date(date), // Convert string to Date object for plotting
    combined_total_ridership: d3.sum(records, d => d.total_ridership)
  })
).sort((a, b) => a.date - b.date) // Sort by date ascending

console.log("Daily combined ridership data:", dailyCombinedRidership.slice(0, 10));
console.log(`Total days: ${dailyCombinedRidership.length}`);
```

```js
// Create the chart: Date (X-axis) vs Combined Total Ridership (Y-axis)
Plot.plot({
  title: "Combined Total Ridership by Date",
  subtitle: "Sum of all stations' ridership for each day",
  width: 1000,
  height: 500,
  x: {
    label: "Date",
    type: "time"
  },
  y: {
    label: "Combined Total Ridership",
    grid: true
  },
  marks: [
    Plot.lineY(dailyCombinedRidership, {
      x: "date",
      y: "combined_total_ridership",
      stroke: "#1f77b4",
      strokeWidth: 2
    }),
    Plot.dot(dailyCombinedRidership, {
      x: "date",
      y: "combined_total_ridership",
      fill: "#1f77b4",
      r: 4
    })
  ]
})
```