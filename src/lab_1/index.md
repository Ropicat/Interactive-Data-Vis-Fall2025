// Lab 1 results
What follows below are my findings from the Pollinator Data I was able to obtain with the help of the Observable Fra

## First, a series of scatter charts to view the Pollinator Data and quickly look for any patterns amongst the data values to identify key bee-specific and exogenous independent variables that appear to impact the production. I then created a series of “drill-down charts” of histograms and stacked histograms to obtain additional insights.


##   ------

## Question 1: Body mass and wing span distribution of species: 

##    =====

## Responses to Question 1: 

•	Plot 1 shows clear and distinct the differences of the physical characters of the three species. I also checked if specie types could impact the nectar production. 

•	Plot 2 and 3 illustrated if the specie’s wing span (Plot 2) and body mass (Plot 3) had any impact on the individual nectar productions. The answer, surprisingly was, “not really.”

## Question 2: What is the ideal weather for Nectar Production 

## Responses: 
•	Plot 5 Individual Nectar Production against Temperature seem to indicate that the low temperature (<18 degrees Celsius) appear to be NOT conductive to nectar production but beyond that lower threshold, there appears to be limited relationship between nectar production and ambient temperature. 

•	Plot 6, which compares individual nectar production to humidity, also shows no distinct pattern.

•	Following up on Plot5, Histogram in Plot 8 does show some weak patterns that the TOTAL nectar production seem to rise 20 to 28 degrees.
•	The Plot 9 histogram, comparisons of weather condition vs average (per bee) nectar production does show higher aggregated production during the cloudy weather conditions, but additional study would be needed to figure out why.

## Question 3: Which flower has the most nectar production

## Responses:

•	Plot 7 clearly indicates, individual flower to flower basis, Sunflower has shown bees can get the most nectar.

•	Stacked histograms in Plot 12 (location based total nectar production, with the flower type data stacked ) and Plot 13 (location based total nectar production, with the bee specie data stacked) indicates that the story is more complex, potentially combining the bee species and flower types for the determination of the aggregated nectar production. Potential impact of increasing the bumble bees needs to be evaluated further. 


```js
const pollinators = FileAttachment( // using FileAttachment instead of d3.csv
  "../data/pollinator_activity_data.csv" // string literal inside the FileAttachment
).csv({ autoType: true }); // this is the observable version of `d3.autoType` that you had in the d3.csv
```


// 1 Plot the pollinators data AGAINST BODY MASS,data points classified by BEE SPECIES (await the FileAttachment CSV result)
```js
Plot.plot({
  marks: [
    Plot.dot(await pollinators, {
      x: "avg_wing_span_mm",
      y: "avg_body_mass_g",
      fill: "pollinator_species",
      r: 4,
  title: d => `${d.pollinator_species || ''}\nwing: ${d.avg_wing_span_mm == null ? '' : Number(d.avg_wing_span_mm).toFixed(0)}\nmass: ${d.avg_body_mass_g == null ? '' : Number(d.avg_body_mass_g).toFixed(1)}`
    })
  ],
  x: {
    label: "Average Wing Span (mm)",
    ticks: 4,
    tickFormat: d => (d == null ? '' : Number(d).toFixed(1)),
    tickRotate: -45,
    tickSize: 8,
    tickPadding: 6
  },
  y: { 
    label: "Average Body Mass (g)", 
    ticks: 5, 
    tickFormat: d => (d == null ? '' : Number(d).toFixed(0)),
    tickSize: 8,
    tickPadding: 6 
  },
  color: { legend: true, label: "Species" },
  // increase bottom margin to make room for rotated tick labels
  marginBottom: 80,
  marginLeft: 70,
  // larger font for better legibility
  style: { fontSize: "22px" },
  width: 1400,
  height: 700
})
```
// 2 Plot the pollinators data (await the FileAttachment CSV result)
// Plot INVIDUDUAL NECTAR PRODUCTION DATA against WING SIZE, data points specified by BEE SPECIES Clear distinctions!!

```js
Plot.plot({
  marks: [
    Plot.dot(await pollinators, {
      x: "avg_wing_span_mm",
      y: "nectar_production",
      fill: "pollinator_species",
      r: 4,
  title: d => `${d.pollinator_species || ''}\nwing: ${d.avg_wing_span_mm == null ? '' : Number(d.avg_wing_span_mm).toFixed(0)}\nnect: ${d.nectar_production == null ? '' : Number(d.nectar_production).toFixed(2)}`
    })
  ],
  x: { label: "Average Wing Span (mm)", ticks: 100, tickFormat: d => (d == null ? '' : Number(d).toFixed(0)) },
  y: { label: "Aggregate Nectar Production", ticks: 100, tickFormat: d => (d == null ? '' : Number(d).toFixed(2)) },
  color: { legend: true, label: "Species" },
  width: 800,
  height: 500
})
```

// 3 Plot the pollinators INDIVIDUAL NECTAR PRODUCTION data AGAINST BODY MASS, data points classified by BEE SPECIES (await the FileAttachment CSV result)
```js
Plot.plot({
  marks: [
    Plot.dot(await pollinators, {
      x: "avg_body_mass_g",
      y: "nectar_production",
      fill: "pollinator_species",
      r: 4,
  title: d => `${d.pollinator_species || ''}\nmass: ${d.avg_body_mass_g == null ? '' : Number(d.avg_body_mass_g).toFixed(2)}\nnect: ${d.nectar_production == null ? '' : Number(d.nectar_production).toFixed(2)}`
    })
  ],
  x: { label: "Average Body Mass (g)", ticks: 100, tickFormat: d => (d == null ? '' : Number(d).toFixed(0)) },
  y: { label: "Nectar Production ()", ticks: 100, tickFormat: d => (d == null ? '' : Number(d).toFixed(2)) },
  color: { legend: true, label: "Species" },
  width: 800,
  height: 500
})
```

// 4. Plot the pollinators INVIDIDUAL NECTAR PRODUCTION data against VISIT COUNT BEE SIZE, data points specified by BEE SPECIES  (await the FileAttachment CSV result) Monst bees visit 0 to 6 times.
```js
Plot.plot({
  marks: [
    // coerce numeric fields and map to a clean array so Plot receives numbers
    Plot.dot((await pollinators).map(d => ({
      ...d,
      visit_count: d.visit_count == null ? null : +d.visit_count,
      nectar_production: d.nectar_production == null ? null : +d.nectar_production
    })), {
      x: "visit_count",
      y: "nectar_production",
      fill: "pollinator_group",
      r: 4,
      title: d => `${d.pollinator_species || ''}\nvisit: ${d.visit_count == null ? '' : d.visit_count}\nnectar: ${d.nectar_production == null ? '' : d.nectar_production}`
    })
  ],
  x: { label: "Visit Count", ticks: 10, tickFormat: d => (d == null ? '' : Number(d).toFixed(0)) },
  y: { label: "Nectar Production", ticks: 10, tickFormat: d => (d == null ? '' : Number(d).toFixed(2)) },
  color: { legend: true, label: "Groups" },
  width: 800,
  height: 500
})
```

// 5. Plot the pollinators NECTAR PRODUCTION data AGAINST TEMPERATURE, data points specified by BEE SPECIES (await the FileAttachment CSV result) Most activities between 20 to 28 degrees

```js
Plot.plot({
  marks: [
    // coerce numeric fields and map to a clean array so Plot receives numbers
    Plot.dot((await pollinators).map(d => ({
      ...d,
      temperature: d.temperature == null ? null : +d.temperature,
      nectar_production: d.nectar_production == null ? null : +d.nectar_production
    })), {
      x: "temperature",
      y: "nectar_production",
      fill: "pollinator_species",
      r: 4,
      title: d => `${d.pollinator_species || ""}\ntemp: ${d.temperature == null ? "" : d.temperature}\nnectar: ${d.nectar_production == null ? "" : d.nectar_production}`
    })
  ],
  x: { label: "Temperature", ticks: 10, tickFormat: d => (d == null ? '' : Number(d).toFixed(0)) },
  y: { label: "Nectar Production", ticks: 10, tickFormat: d => (d == null ? '' : Number(d).toFixed(2)) },
  color: { legend: true, label: "Species" },
  width: 800,
  height: 500
})
```

// 6. Plot the pollinators individual NECTAR PRODUCTION data against HUMIDITY data points specified by WEATHER (await the FileAttachment CSV result)
```js
Plot.plot({
  marks: [
    // coerce numeric fields and map to a clean array so Plot receives numbers
    Plot.dot((await pollinators).map(d => ({
      ...d,
      humidity: d.humidity == null ? null : +d.humidity,
      nectar_production: d.nectar_production == null ? null : +d.nectar_production
    })), {
      x: "humidity",
      y: "nectar_production",
      fill: "weather_condition",
      r: 4,
  title: d => `${d.pollinator_species || ''}\nwing: ${d.temperature == null ? '' : d.temperature}\nnectar: ${d.nectar_production == null ? '' : d.nectar_production}`
    })
  ],
  x: { label: "Humidity", ticks: 10, tickFormat: d => (d == null ? '' : Number(d).toFixed(0)) },
  y: { label: "Nectar Production", ticks: 10, tickFormat: d => (d == null ? '' : Number(d).toFixed(2)) },
  color: { legend: true, label: "Weather Condition" },
  width: 800,
  height: 500
})
```

// 7. Plot the pollinators NECTAR PRODUCTION data AGAINST TEMPERATURE data points specified by FLOWER SPECIES (await the FileAttachment CSV result) Sunflower appears to be the winner!
```js
Plot.plot({
  marks: [
    // coerce numeric fields and map to a clean array so Plot receives numbers
    Plot.dot((await pollinators).map(d => ({
      ...d,
  temperature: d.temperature == null ? null : +d.temperature,
      nectar_production: d.nectar_production == null ? null : +d.nectar_production
    })), {
      x: "temperature",
      y: "nectar_production",
      fill: "flower_species",
      r: 4,
  title: d => `${d.flower_species|| ''}\nflow: ${d.temperature == null ? '' : d.temperature}\nnectar: ${d.nectar_production == null ? '' : d.nectar_production}`
    })
  ],
  x: { label: "Temperature", ticks: 10, tickFormat: d => (d == null ? '' : Number(d).toFixed(0)) },
  y: { label: "Nectar Production", ticks: 10, tickFormat: d => (d == null ? '' : Number(d).toFixed(2)) },
  color: { legend: true, label: "Flower types" },
  width: 800,
  height: 500
})
```
// 8: Histogram TEMPERATURE and AGGREGATED NECTAR PRODUCTION Confirms the eyeballing done with Plot 5

```js

Plot.plot({
  x: { label: "Temperature" },
  y: { label: "Total Nectar Production" },
  marks: [
    Plot.barY(await pollinators, {
      x: "temperature",
      y: "nectar_production",
      reduce: "sum"
    }),

    Plot.ruleY([0])
  ]
})
```

// 9: Histogram WEATHER CONDITION and AVERAGE NECTAR PRODUCTION Sunny weather may be avoided by the bees??

```js

Plot.plot({
  x: { label: "Weather" },
  y: { label: "Average Nectar Production" },
  marks: [
    Plot.barY(await pollinators, {
      x: "weather_condition",
      y: "nectar_production",
      reduce: "mean",
      fill: "#8da0cb"
    }),

    Plot.ruleY([0])
  ]
})

```

// 10: Histogram HUMIDITY and AVERAGE NECTAR PRODUCTION


```js

Plot.plot({
  x: { label: "Humidity" },
  y: { label: "Average Nectar Production" },
  marks: [
    Plot.barY(await pollinators, {
      x: "humidity",
      y: "nectar_production",
      reduce: "mean",
      fill: "#a8ddb5"
    }),

    Plot.ruleY([0])
  ]
})
```


// 11 Histogram plot - grouped by pollinator species with average/mean nectar production (sorted) Bumblebees being in the most nectar (they are the most numerous, but also productive, as measured in "mean/average")

```js

Plot.plot({
  x: { label: "Pollinator Species" },
  y: { label: "Total Nectar Production" },
  marks: [
    Plot.barY(await pollinators, {
      x: "pollinator_species",
      y: "nectar_production",
      fill: "pollinator_species",
      reduce: "mean",
      sort: { x: "y", reverse: true },
      r: 4,
    }),

    Plot.ruleY([0])
  ]
})
```
// 12 LOCATION BASED TOTAL NECSTAR PRODUCTION, WITH FLOWER SPECIES IN STACKED FORM (Difficult to compare as we do not know the actual areas of the different locations)

```js

// Histogram plot - Location-based with three stacked flower species components
Plot.plot({
  x: { label: "Location" },
  y: { label: "Total Nectar Production" },
  color: { 
    legend: true,
    domain: ["Coneflower", "Lavender", "Sunflower"],
    range: ["#e74c3c", "#2ecc71", "#f39c12"]
  },
  marks: [
    Plot.barY(await pollinators, {
      x: "location",
      y: "nectar_production",
      fill: "flower_species",
      reduce: "sum",
      order: "sum"
    }),

    Plot.ruleY([0])
  ]
})
```

// 13 Histogram plot - LOCATION BASED TOTAL NECTAR PRODUCTION with three stacked Form BEE SPECIES (most numerous bumblebees bring in the most aggregate nectora production, closely followed by honeybees)

```js

Plot.plot({
  x: { label: "Location" },
  y: { label: "Total Nectar Production" },
  color: { 
    legend: true,
    domain: ["Bumblebee", "Honeybee", "Carpenter Bee"],
    range: ["#e74c3c", "#2ecc71", "#f39c12"]
  },
  marks: [
    Plot.barY(await pollinators, {
      x: "location",
      y: "nectar_production",
      fill: "pollinator_species",
      reduce: "sum",
      order: "sum"
    }),

    Plot.ruleY([0])
  ]
})
```

```js

import * as Plot from "@observablehq/plot"
import {bin} from "d3-array"

// Sample data
const data = [
  {response_time: 120},
  {response_time: 300},
  {response_time: 150},
  {response_time: 90},
  {response_time: 200},
  {response_time: 310}
]

```



