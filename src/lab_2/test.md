---
title: "Lab 2: Test"
toc: true
---

# Simple Test Page

```js
console.log("=== TESTING DATA LOADING ===");
```

```js
const incidents = FileAttachment("./data/incidents.csv").csv({ typed: true })
console.log("Incidents loaded:", incidents);
```

```js
const ridership = FileAttachment("./data/ridership.csv").csv({ typed: true })
console.log("Ridership loaded:", ridership);
```

```js
console.log("Incidents first record:", incidents[0]);
console.log("Ridership first record:", ridership[0]);
```

```js
incidents.slice(0,3)
```

```js
ridership.slice(0,3)
```