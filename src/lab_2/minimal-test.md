---
title: "Lab 2: Simple Table Test"
toc: true
---

# Simple Table Test

```js
console.log("Testing basic functionality...");
```

```js
// Test basic data loading
const incidents = FileAttachment("./data/incidents.csv").csv({ typed: true })
console.log("Incidents loaded:", incidents);
```

```js
// Simple test table with static data
const testData = [
  {date: "2023-01-01", station: "Test Station", ridership: 1000},
  {date: "2023-01-02", station: "Test Station 2", ridership: 1500},
  {date: "2023-01-03", station: "Test Station 3", ridership: 2000}
];

console.log("Test data:", testData);
```

```js
// Basic table - should definitely work
Inputs.table(testData)
```

```js
// Test with incidents data (first 5 rows)
if (incidents && incidents.length > 0) {
  Inputs.table(incidents.slice(0, 5))
} else {
  console.log("No incidents data available")
}
```