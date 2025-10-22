---
title: "Lab 1: Passing Pollinators"
toc: true
---

// Lab-1 Pollinator Activity

//This page is where you can iterate. Follow the lab instructions in the [readme.md](./README.md).


```js
const url = "pollinator_activity_data.csv";
const pollinators = await d3.csv(url, d3.autoType);
pollinators.slice(0, 3)
```