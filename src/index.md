---
title: "Lab 0: Getting Started"
toc: true
---

This page is where you can iterate. Follow the lab instructions in the [readme.md](./README.md).

My apartment has been taken over by cats!!

<div>HELLO FROM THE EMPIRE OF CATS</div>

<h1>WHERE HUMANS ARE BUT SERVANTS<h1>

<pre>THE THREE CATS THAT CONTROL ME AND MY WIFE</pre>

<div class="grid grid-cols-4">
<h1 class="card">Name and Age and their role</h1>
<h1 class="card">Miya   14 years Old  FIRE QUEEN</h1>
<h1 class="card">Rena    3 years Old  ICE EMPRESS</h1>
<h1 class="card">Tobo    3 years Old  LION KING</h1>
<div>

<div class="tip">Think carefully before you make your fateful decision to pick a cat from the list below</div>

```js
console.log("Hello, world");
alert("say it...you love the cats");
```
```js
const data =[3,"cats",2,"humans"];
//display(data);
const name1 ="Masaru";
```
```js
data
```

this index markdown is prepared by `${name1}`

```js
//const value=Math.random()
const family=["Miya","Rena","Tobo","Ryoko","Masaru"];
const count=family.length;
```
We are the family of `${count}`

```js
const cat=view(Inputs.select(["Miya the Fire Queen","Rena the Ice Queen", "Tobo the Lion King", "Ryoko Chief Caretaker", "Masaru the Servant"],{label:"Favorite Nobility:", value: "Miya the Fire Queen"}));
```

Type in below My fovorite cat from my personal life is `${cat2}`!

```js
let cat2=view(Inputs.text());
```

// Histogram: Nectar production → Count
```js
import {Plot} from "@observablehq/plot"
import * as d3 from "d3"

// load nectar values: prefer FileAttachment in the notebook preview, else use a small sample
const rows = (typeof FileAttachment !== 'undefined')
  ? await FileAttachment("data/pollinator_activity_data.csv").csv({autoType:true})
  : [{nectar_production:0.63},{nectar_production:0.53},{nectar_production:1}];

const data = rows
  .map(r => ({nectar: r.nectar_production == null ? NaN : +r.nectar_production}))
  .filter(d => !Number.isNaN(d.nectar));

const bins = d3.bin().value(d => d.nectar).thresholds(20)(data);

Plot.plot({
  x: { label: "Nectar production", tickFormat: d => (d == null ? '' : Number(d).toFixed(2)) },
  y: { label: "Count" },
  marks: [
    Plot.rectY(bins.map(b => ({ x0: b.x0, x1: b.x1, count: b.length })), {
      x1: "x0", x2: "x1", y: "count", fill: "#4C78A8",
      title: d => `${Number(d.x0).toFixed(2)}–${Number(d.x1).toFixed(2)}: ${d.count}`
    })
  ]
})
```