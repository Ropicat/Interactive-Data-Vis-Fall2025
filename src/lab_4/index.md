---
title: "Lab 4: Clearwater Crisis"
toc: false
---

// IN THIS EXERCISE, I TRIED TO INCORPORATE THE INTERACTIVE ELEMENTS AS MUCH AS POSSIBLE, SO THAT THE 'READER' OF THESE CHARTS CAN, VIA INTERACTIVE INFORMATION COLLECTION, GRASP THE LIKELIHOOD OF THE CULPIT (CHEMTECH) AND WHICH FISH ARE BEING IMPACTED, TROUT NEGATIVELY, CARP POSITIVELY, AND WHAT WATER_QUALITY ELEMENTS (HEAVY METAL AND TURBIDITY)COULD BE CAUSING THE FISH POPULATION CHANGES.

```js
// Load the four data files
const fishSurveysRaw = await FileAttachment("data/fish_surveys.csv").csv({typed: true});
const monitoringStations = await FileAttachment("data/monitoring_stations.csv").csv({typed: true});
const suspectActivities = await FileAttachment("data/suspect_activities.csv").csv({typed: true});
const waterQualityRaw = await FileAttachment("data/water_quality.csv").csv({typed: true});

// Add nearby_entity column to fish surveys based on station_id
const nearbyEntityMap = {
  "West": "ChemTech Manufacturing",
  "South": "Clearwater Fishing Lodge",
  "North": "Riverside Farm",
  "East": "Lakewood Resort"
};

const fishSurveys = fishSurveysRaw.map(d => ({
  ...d,
  nearby_entity: nearbyEntityMap[d.station_id] || "Unknown"
}));

// Add nearby_entity column to water quality based on station_id
const waterQuality = waterQualityRaw.map(d => ({
  ...d,
  nearby_entity: nearbyEntityMap[d.station_id] || "Unknown"
}));
```

```js
// Display data summaries
display(html`<h3>Fish Surveys</h3>`);
display(Inputs.table(fishSurveys));

display(html`<h3>Monitoring Stations</h3>`);
display(Inputs.table(monitoringStations));

display(html`<h3>Suspect Activities</h3>`);
display(Inputs.table(suspectActivities));

display(html`<h3>Water Quality</h3>`);
display(Inputs.table(waterQuality));
```
// """"""""""""""""""""""""""""""""""""

// INTERACTIVITY ONE, PULL DOWN MENU TO PICK A FISH CATEGORY


```js
// Fish species selector
// const selectedFish = view(Inputs.select(["Trout", "Bass", "Carp"], {
//   label: "Select Fish Species",
//   value: "Trout"
// }));
```

```js
// Fish species selector
const selectedFish = view(Inputs.select(["Trout", "Bass", "Carp"], {
  label: "Select Fish Species",
  value: "Trout"
}));
```

```js
// Filter fish surveys by selected species and aggregate count by date
const filteredFishData = fishSurveys.filter(d => d.species === selectedFish);

// Group by date and sum counts across all stations
const fishCountByDate = d3.rollups(
  filteredFishData,
  v => d3.sum(v, d => d.count),
  d => d.date
).map(([date, count]) => ({date: new Date(date), count}));

// Sort by date
fishCountByDate.sort((a, b) => a.date - b.date);
```

```js
// Line chart for fish count over time
display(Plot.plot({
  title: `${selectedFish} Population Over Time`,
  width: 800,
  height: 400,
  x: {
    label: "Date",
    type: "time"
  },
  y: {
    label: "Total Count (All Stations)",
    grid: true
  },
  marks: [
    Plot.lineY(fishCountByDate, {x: "date", y: "count", stroke: "steelblue", strokeWidth: 2}),
    Plot.dot(fishCountByDate, {x: "date", y: "count", fill: "steelblue"})
  ]
}));
```

//'''''''''''''''''''''''''''''''''''''''

//INTERACTIVITY TWO SELECT NEARBY ENTITY (WHICH ENTITIES ARE VERY CLOSE TO THE WATER AND FISH SAMPLE STATION) THE SELECTION WILL DYNAMICALLY ADJUST THE NEXT THREE CHARTS

```js
// Nearby entity selector (radio buttons)
const selectedEntity = view(Inputs.radio(
  ["ChemTech Manufacturing", "Clearwater Fishing Lodge", "Riverside Farm", "Lakewood Resort"],
  {
    label: "Select Nearby Entity",
    value: "ChemTech Manufacturing"
  }
));
```

```js
// Filter fish surveys by selected entity and species
const filteredFishByEntitySpecies = fishSurveys.filter(
  d => d.nearby_entity === selectedEntity && d.species === selectedFish
);
```

```js
// Bar chart for average weight by date
display(Plot.plot({
  title: `${selectedFish} Average Weight at ${selectedEntity}`,
  width: 800,
  height: 400,
  x: {
    label: "Date",
    type: "band",
    tickRotate: -45
  },
  y: {
    label: "Average Weight (g)",
    grid: true
  },
  marks: [
    Plot.barY(filteredFishByEntitySpecies, {
      x: d => d3.timeFormat("%Y-%m-%d")(new Date(d.date)),
      y: "avg_weight_g",
      fill: "steelblue",
      tip: true
    }),
    Plot.ruleY([0])
  ]
}));
```

```js
// Bar chart for average length by date
display(Plot.plot({
  title: `${selectedFish} Average Length at ${selectedEntity}`,
  width: 800,
  height: 400,
  x: {
    label: "Date",
    type: "band",
    tickRotate: -45
  },
  y: {
    label: "Average Length (cm)",
    grid: true
  },
  marks: [
    Plot.barY(filteredFishByEntitySpecies, {
      x: d => d3.timeFormat("%Y-%m-%d")(new Date(d.date)),
      y: "avg_length_cm",
      fill: "steelblue",
      tip: true
    }),
    Plot.ruleY([0])
  ]
}));
```

```js
// Prepare data with month-over-month comparison for coloring
const sortedFishData = [...filteredFishByEntitySpecies].sort((a, b) => new Date(a.date) - new Date(b.date));

const fishCountWithChange = sortedFishData.map((d, i) => {
  const prevCount = i > 0 ? sortedFishData[i - 1].count : d.count;
  const percentChange = (d.count - prevCount) / prevCount;
  const declined = percentChange < -0.10; // More than 10% decline
  return {
    ...d,
    declined
  };
});
```
//---------------------------------------------

//BIG NEGATIVE CHANGES IN FISH POPULATION IS RECORDED AS RED COLORED BARS IN BAR CHARTS

```js
// Bar chart for fish count by date with conditional coloring
display(Plot.plot({
  title: `${selectedFish} Count at ${selectedEntity}`,
  width: 800,
  height: 400,
  x: {
    label: "Date",
    type: "band",
    tickRotate: -45
  },
  y: {
    label: "Count",
    grid: true
  },
  color: {
    domain: [false, true],
    range: ["steelblue", "red"]
  },
  marks: [
    Plot.barY(fishCountWithChange, {
      x: d => d3.timeFormat("%Y-%m-%d")(new Date(d.date)),
      y: "count",
      fill: "declined",
      tip: true
    }),
    Plot.ruleY([0])
  ]
}));
```

//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

//INTERACTIVITY THREE: SELECTING THE POSSIBLE CULPIT, BOTH IN TERMS OF ENTITY AND OF THE POLLUTANT, WITH THE LAST CHART ARTICULATING THE CHEMTECH'S NOTICEABLE DIFFERENCES IN POLLUTANT GENERATIONS RELATIVE TO THE OTHER THREE ENTITIES, ESPECIALLY HEAVY METALS AND TURBIDITY

```js
// Water quality metrics selector (checkboxes - max 2 selections)
const metricsInput = Inputs.checkbox(
  ["nitrogen_mg_per_L", "phosphorus_mg_per_L", "heavy_metals_ppb", "turbidity_ntu"],
  {
    label: "Select Water Quality Metrics (max 2)",
    value: ["nitrogen_mg_per_L"]
  }
);

// Limit selection to maximum of 2
const selectedMetrics = Generators.input(metricsInput);
metricsInput.addEventListener("input", () => {
  if (metricsInput.value.length > 2) {
    metricsInput.value = metricsInput.value.slice(-2);
    metricsInput.dispatchEvent(new Event("input"));
  }
});
display(metricsInput);
```

```js
// Filter water quality by selected entity
const filteredWaterQuality = waterQuality.filter(d => d.nearby_entity === selectedEntity);

// Aggregate water quality data by month (average)
const waterQualityByMonth = d3.rollups(
  filteredWaterQuality,
  v => ({
    nitrogen_mg_per_L: d3.mean(v, d => d.nitrogen_mg_per_L),
    phosphorus_mg_per_L: d3.mean(v, d => d.phosphorus_mg_per_L),
    heavy_metals_ppb: d3.mean(v, d => d.heavy_metals_ppb),
    turbidity_ntu: d3.mean(v, d => d.turbidity_ntu)
  }),
  d => d3.timeMonth(new Date(d.date))
).map(([date, values]) => ({
  date,
  ...values
})).sort((a, b) => a.date - b.date);
```

```js
// Get selected metrics (default to first two if none selected)
const metric1 = selectedMetrics[0] || "nitrogen_mg_per_L";
const metric2 = selectedMetrics[1] || null;

// Calculate domains for dual y-axis scaling
const y1Domain = d3.extent(waterQualityByMonth, d => d[metric1]);
const y2Domain = metric2 ? d3.extent(waterQualityByMonth, d => d[metric2]) : null;

// Metric labels for display
const metricLabels = {
  nitrogen_mg_per_L: "Nitrogen (mg/L)",
  phosphorus_mg_per_L: "Phosphorus (mg/L)",
  heavy_metals_ppb: "Heavy Metals (ppb)",
  turbidity_ntu: "Turbidity (NTU)"
};
```

```js
// Dual-axis line chart for water quality metrics
display(Plot.plot({
  title: `Water Quality Metrics at ${selectedEntity} (Monthly Average)`,
  width: 800,
  height: 450,
  x: {
    label: "Date",
    type: "time"
  },
  y: {
    label: metricLabels[metric1],
    grid: true,
    domain: y1Domain
  },
  marks: [
    // Primary metric line (smoothed with curve)
    Plot.line(waterQualityByMonth, {
      x: "date",
      y: metric1,
      stroke: "steelblue",
      strokeWidth: 2,
      curve: "catmull-rom"
    }),
    Plot.dot(waterQualityByMonth, {
      x: "date",
      y: metric1,
      fill: "steelblue",
      tip: true
    }),
    // Secondary metric line (if selected) - scaled to primary axis range
    ...(metric2 ? [
      Plot.line(waterQualityByMonth, {
        x: "date",
        y: d => {
          // Scale secondary metric to primary axis range
          const [y2Min, y2Max] = y2Domain;
          const [y1Min, y1Max] = y1Domain;
          return y1Min + ((d[metric2] - y2Min) / (y2Max - y2Min)) * (y1Max - y1Min);
        },
        stroke: "orange",
        strokeWidth: 2,
        curve: "catmull-rom"
      }),
      Plot.dot(waterQualityByMonth, {
        x: "date",
        y: d => {
          const [y2Min, y2Max] = y2Domain;
          const [y1Min, y1Max] = y1Domain;
          return y1Min + ((d[metric2] - y2Min) / (y2Max - y2Min)) * (y1Max - y1Min);
        },
        fill: "orange",
        title: d => `${metricLabels[metric2]}: ${d[metric2].toFixed(3)}`
      })
    ] : [])
  ]
}));

// Display legend and secondary axis info
display(html`
  <div style="display: flex; gap: 20px; align-items: center; margin-top: 10px;">
    <div><span style="color: steelblue;">●</span> ${metricLabels[metric1]}</div>
    ${metric2 ? html`<div><span style="color: orange;">●</span> ${metricLabels[metric2]} (Range: ${y2Domain[0]?.toFixed(3)} - ${y2Domain[1]?.toFixed(3)})</div>` : ''}
  </div>
`);
```

```js
// Filter water quality for OTHER entities (excluding selected)
const otherEntitiesWaterQuality = waterQuality.filter(d => d.nearby_entity !== selectedEntity);

// Aggregate other entities' water quality data by month (average across all other entities)
const otherEntitiesWQByMonth = d3.rollups(
  otherEntitiesWaterQuality,
  v => ({
    nitrogen_mg_per_L: d3.mean(v, d => d.nitrogen_mg_per_L),
    phosphorus_mg_per_L: d3.mean(v, d => d.phosphorus_mg_per_L),
    heavy_metals_ppb: d3.mean(v, d => d.heavy_metals_ppb),
    turbidity_ntu: d3.mean(v, d => d.turbidity_ntu)
  }),
  d => d3.timeMonth(new Date(d.date))
).map(([date, values]) => ({
  date,
  ...values
})).sort((a, b) => a.date - b.date);
```

```js
// Calculate domains for dual y-axis scaling (other entities)
const y1DomainOther = d3.extent(otherEntitiesWQByMonth, d => d[metric1]);
const y2DomainOther = metric2 ? d3.extent(otherEntitiesWQByMonth, d => d[metric2]) : null;
```

```js
// Dual-axis line chart for water quality metrics (Other Entities Average)
display(Plot.plot({
  title: `Water Quality Metrics - Average of Other Entities (Excluding ${selectedEntity})`,
  width: 800,
  height: 450,
  x: {
    label: "Date",
    type: "time"
  },
  y: {
    label: metricLabels[metric1],
    grid: true,
    domain: y1DomainOther
  },
  marks: [
    // Primary metric line (smoothed with curve)
    Plot.line(otherEntitiesWQByMonth, {
      x: "date",
      y: metric1,
      stroke: "steelblue",
      strokeWidth: 2,
      curve: "catmull-rom"
    }),
    Plot.dot(otherEntitiesWQByMonth, {
      x: "date",
      y: metric1,
      fill: "steelblue",
      tip: true
    }),
    // Secondary metric line (if selected) - scaled to primary axis range
    ...(metric2 ? [
      Plot.line(otherEntitiesWQByMonth, {
        x: "date",
        y: d => {
          // Scale secondary metric to primary axis range
          const [y2Min, y2Max] = y2DomainOther;
          const [y1Min, y1Max] = y1DomainOther;
          return y1Min + ((d[metric2] - y2Min) / (y2Max - y2Min)) * (y1Max - y1Min);
        },
        stroke: "orange",
        strokeWidth: 2,
        curve: "catmull-rom"
      }),
      Plot.dot(otherEntitiesWQByMonth, {
        x: "date",
        y: d => {
          const [y2Min, y2Max] = y2DomainOther;
          const [y1Min, y1Max] = y1DomainOther;
          return y1Min + ((d[metric2] - y2Min) / (y2Max - y2Min)) * (y1Max - y1Min);
        },
        fill: "orange",
        title: d => `${metricLabels[metric2]}: ${d[metric2].toFixed(3)}`
      })
    ] : [])
  ]
}));

// Display legend and secondary axis info for other entities chart
display(html`
  <div style="display: flex; gap: 20px; align-items: center; margin-top: 10px;">
    <div><span style="color: steelblue;">●</span> ${metricLabels[metric1]}</div>
    ${metric2 ? html`<div><span style="color: orange;">●</span> ${metricLabels[metric2]} (Range: ${y2DomainOther[0]?.toFixed(3)} - ${y2DomainOther[1]?.toFixed(3)})</div>` : ''}
  </div>
`);
```

```js
// Calculate the difference between selectedEntity and average of other entities for each month
const differenceData = waterQualityByMonth.map((d, i) => {
  const otherData = otherEntitiesWQByMonth.find(o => o.date.getTime() === d.date.getTime());
  return {
    date: d.date,
    month: d3.timeFormat("%Y-%m")(d.date),
    diff_metric1: otherData ? (d[metric1] - otherData[metric1]) : 0,
    diff_metric2: metric2 && otherData ? (d[metric2] - otherData[metric2]) : 0,
    metric1_name: metric1,
    metric2_name: metric2
  };
});

// Reshape data for grouped bar chart
const differenceDataLong = differenceData.flatMap(d => [
  { month: d.month, metric: metricLabels[metric1], difference: d.diff_metric1, metricKey: "metric1" },
  ...(metric2 ? [{ month: d.month, metric: metricLabels[metric2], difference: d.diff_metric2, metricKey: "metric2" }] : [])
]);
```

```js
// Calculate domains for the difference chart
const diff1Extent = d3.extent(differenceData, d => d.diff_metric1);
const diff2Extent = metric2 ? d3.extent(differenceData, d => d.diff_metric2) : [0, 0];

// Combined extent for primary axis
const diffY1Domain = [
  Math.min(diff1Extent[0], 0),
  Math.max(diff1Extent[1], 0)
];
const diffY2Domain = metric2 ? [
  Math.min(diff2Extent[0], 0),
  Math.max(diff2Extent[1], 0)
] : null;
```

```js
// Dual-axis bar chart showing difference between selectedEntity and other entities
display(Plot.plot({
  title: `Difference: ${selectedEntity} vs Average of Other Entities`,
  subtitle: "Positive = Selected Entity Higher, Negative = Other Entities Higher",
  width: 800,
  height: 450,
  x: {
    label: "Month",
    type: "band",
    tickRotate: -45
  },
  y: {
    label: `Δ ${metricLabels[metric1]}`,
    grid: true
  },
  color: {
    domain: [metricLabels[metric1], ...(metric2 ? [metricLabels[metric2]] : [])],
    range: ["steelblue", "orange"]
  },
  fx: {
    padding: 0.2
  },
  marks: [
    // Bars for metric 1
    Plot.barY(differenceData, {
      x: "month",
      y: "diff_metric1",
      fill: "steelblue",
      dx: metric2 ? -8 : 0,
      tip: true,
      title: d => `${metricLabels[metric1]}: ${d.diff_metric1.toFixed(4)}`
    }),
    // Bars for metric 2 (if selected) - scaled to primary axis
    ...(metric2 ? [
      Plot.barY(differenceData, {
        x: "month",
        y: d => {
          // Scale metric2 difference to metric1 range
          const [y2Min, y2Max] = diffY2Domain;
          const [y1Min, y1Max] = diffY1Domain;
          if (y2Max === y2Min) return 0;
          return y1Min + ((d.diff_metric2 - y2Min) / (y2Max - y2Min)) * (y1Max - y1Min);
        },
        fill: "orange",
        dx: 8,
        title: d => `${metricLabels[metric2]}: ${d.diff_metric2.toFixed(4)}`
      })
    ] : []),
    // Zero reference line
    Plot.ruleY([0], {stroke: "black", strokeWidth: 1})
  ]
}));

// Display legend for difference chart
display(html`
  <div style="display: flex; gap: 20px; align-items: center; margin-top: 10px;">
    <div><span style="color: steelblue;">■</span> Δ ${metricLabels[metric1]}</div>
    ${metric2 ? html`<div><span style="color: orange;">■</span> Δ ${metricLabels[metric2]} (Range: ${diffY2Domain[0]?.toFixed(4)} to ${diffY2Domain[1]?.toFixed(4)})</div>` : ''}
  </div>
`);
```
