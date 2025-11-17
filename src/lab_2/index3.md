---
title: "Lab 2: Subway Staffing"
toc: true
---

# Lab 2: Data Loading Test

```js
// Load all data files
const incidents = FileAttachment("data/incidents.csv").csv({typed: true});
const local_events = FileAttachment("data/local_events.csv").csv({typed: true});
const ridership = FileAttachment("data/ridership.csv").csv({typed: true});
const upcoming_events = FileAttachment("data/upcoming_events.csv").csv({typed: true});
```

```js
// Display first 5 rows of incidents data
incidents.slice(0, 5)
```

```js
// Display first 5 rows of upcoming_events data
upcoming_events.slice(0, 5)
```
```js
ridership.slice(0,5)
```
```js
local_events.slice(0,5)
```

## Data Combination: Ridership + Incidents

```js
// Combine ridership data with incidents data
const ridership_incidents_combined = ridership.map(ridershipRecord => {
  // Convert ridership date to YYYY-MM-DD format for comparison
  const ridershipDateStr = new Date(ridershipRecord.date).toISOString().split('T')[0];
  
  // Check if there's a matching incident for this date and station
  const matchingIncident = incidents.find(incident => {
    const incidentDateStr = new Date(incident.date).toISOString().split('T')[0];
    return incidentDateStr === ridershipDateStr && incident.station === ridershipRecord.station;
  });
  
  // Create combined record
  return {
    ...ridershipRecord,
    "Incident Taking Place": matchingIncident ? 1 : 0,
    incident_severity: matchingIncident ? matchingIncident.severity : null,
    incident_response_time: matchingIncident ? matchingIncident.response_time_minutes : null,
    incident_staffing: matchingIncident ? matchingIncident.staffing_count : null
  };
});

console.log("=== DATA COMBINATION RESULTS ===");
console.log("Total ridership records:", ridership.length);
console.log("Total incident records:", incidents.length);
console.log("Combined records:", ridership_incidents_combined.length);

// Count records with incidents
const recordsWithIncidents = ridership_incidents_combined.filter(record => record["Incident Taking Place"] === 1);
console.log("Records with incidents:", recordsWithIncidents.length);

ridership_incidents_combined
```

```js
// Display complete combined data table with all columns and all rows
Inputs.table(ridership_incidents_combined)
```

## Triple Combination: Ridership + Incidents + Local Events

```js
// Combine ridership_incidents_combined with local_events data
const final_combined_dataset = ridership_incidents_combined.map(record => {
  // Convert record date to YYYY-MM-DD format for comparison
  const recordDateStr = new Date(record.date).toISOString().split('T')[0];
  
  // Find matching local events for this date and station
  const matchingLocalEvents = local_events.filter(event => {
    const eventDateStr = new Date(event.date).toISOString().split('T')[0];
    return eventDateStr === recordDateStr && event.nearby_station === record.station;
  });
  
  // Calculate total attendance and count of events
  const totalAttendance = matchingLocalEvents.reduce((sum, event) => sum + (event.estimated_attendance || 0), 0);
  const eventCount = matchingLocalEvents.length;
  
  // Create the final combined record
  return {
    ...record,
    number_of_local_events: eventCount,
    total_event_attendance: totalAttendance,
    local_event_details: matchingLocalEvents.length > 0 ? matchingLocalEvents : null,
    has_local_events: eventCount > 0 ? 1 : 0
  };
});

console.log("=== FINAL COMBINED DATASET RESULTS ===");
console.log("Total final combined records:", final_combined_dataset.length);
console.log("Records with local events:", final_combined_dataset.filter(r => r.has_local_events === 1).length);
console.log("Total events matched:", final_combined_dataset.reduce((sum, r) => sum + r.number_of_local_events, 0));

final_combined_dataset
```

```js
// Display complete final combined dataset with all columns and all rows
Inputs.table(final_combined_dataset)
```

## Daily Ridership with Incident Analysis

```js
// Process final_combined_dataset for daily ridership chart
const dailyRidershipData = d3.rollup(
  final_combined_dataset,
  v => ({
    date: new Date(v[0].date),
    total_ridership: d3.sum(v, d => d.entrances + d.exits),
    has_low_incident: v.some(d => d["Incident Taking Place"] === 1 && d.incident_severity === "low"),
    has_medium_incident: v.some(d => d["Incident Taking Place"] === 1 && d.incident_severity === "medium"),
    has_high_incident: v.some(d => d["Incident Taking Place"] === 1 && d.incident_severity === "high")
  }),
  d => new Date(d.date).toISOString().split('T')[0]
);

// Convert to array and sort by date
const dailyChartData = Array.from(dailyRidershipData.values()).sort((a, b) => a.date - b.date);

console.log("Daily ridership chart data:", dailyChartData.length, "days");
console.log("Sample:", dailyChartData.slice(0, 3));

dailyChartData
```

```js
// Create daily ridership line chart with incident markers
Plot.plot({
  title: "Daily Ridership with Incident Severity Markers (75 Days)",
  subtitle: "Total daily ridership with colored dots indicating incident severity",
  width: 1200,
  height: 500,
  marginLeft: 80,
  marginBottom: 60,
  x: {
    label: "Date (Chronological Order)",
    type: "time"
  },
  y: {
    label: "Daily Ridership (Entrances + Exits)",
    grid: true,
    tickFormat: "~s",
    domain: [0, 800000]
  },
  marks: [
    // Main ridership line
    Plot.line(dailyChartData, {
      x: "date",
      y: "total_ridership",
      stroke: "#2563eb",
      strokeWidth: 2
    }),
    // Base dots for all days
    Plot.dot(dailyChartData, {
      x: "date",
      y: "total_ridership", 
      fill: "#2563eb",
      r: 3,
      fillOpacity: 0.7
    }),
    // High severity incident dots (on top)
    Plot.dot(dailyChartData.filter(d => d.has_high_incident), {
      x: "date",
      y: "total_ridership",
      fill: "#dc2626",
      r: 10,
      stroke: "#ffffff",
      strokeWidth: 2
    }),
    // Medium severity incident dots
    Plot.dot(dailyChartData.filter(d => d.has_medium_incident), {
      x: "date", 
      y: "total_ridership",
      fill: "#ea580c",
      r: 8,
      stroke: "#ffffff", 
      strokeWidth: 2
    }),
    // Low severity incident dots  
    Plot.dot(dailyChartData.filter(d => d.has_low_incident), {
      x: "date",
      y: "total_ridership",
      fill: "#ca8a04",
      r: 6,
      stroke: "#ffffff",
      strokeWidth: 1
    })
  ]
})
```

## Quarterly Incident Analysis (Last 10 Years)

```js
// Aggregate incidents by quarter (count all incidents per quarter)
const quarterlyIncidentData = incidents.map(d => {
  const date = new Date(d.date);
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return {
    quarter: `${year}-Q${quarter}`
  };
});

// Filter for last 10 years
const currentYear = 2025;
const last10Years = Array.from({length: 10 * 4}, (_, i) => {
  const year = currentYear - 9 + Math.floor(i / 4);
  const quarter = (i % 4) + 1;
  return `${year}-Q${quarter}`;
});

// Group by quarter and count incidents
const quarterlyCounts = Array.from(
  d3.rollup(
    quarterlyIncidentData,
    v => v.length,
    d => d.quarter
  ),
  ([quarter, count]) => ({ quarter, incident_count: count })
).filter(d => last10Years.includes(d.quarter))
 .sort((a, b) => last10Years.indexOf(a.quarter) - last10Years.indexOf(b.quarter));

quarterlyCounts
```

```js
// Bar chart for quarterly incident counts
Plot.plot({
  title: "Quarterly Incident Counts (Last 10 Years)",
  width: 1200,
  height: 500,
  marginLeft: 80,
  marginBottom: 100,
  x: {
    label: "Quarter",
    tickRotate: -45,
    domain: quarterlyCounts.map(d => d.quarter)
  },
  y: {
    label: "Number of Incidents",
    grid: true,
    nice: true,
    zero: true
  },
  marks: [
    Plot.barY(quarterlyCounts, {
      x: "quarter",
      y: "incident_count",
      fill: "#dc2626",
      fillOpacity: 0.8,
      stroke: "#b91c1c",
      strokeWidth: 1,
      title: d => `${d.quarter}\nIncidents: ${d.incident_count}`
    }),
    Plot.ruleY([0])
  ]
})
```

## Quarterly Incident Severity Stacked Bar Chart

```js
// Prepare quarterly incident data by severity (for static stacked chart)
const severityColors = {
  low: '#ca8a04',    // yellow
  medium: '#ea580c', // orange
  high: '#dc2626'    // red
};

const quarterlySeverityDataStatic = incidents.map(d => {
  const date = new Date(d.date);
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return {
    quarter: `${year}-Q${quarter}`,
    severity: d.severity
  };
});

const severityGroupedStatic = d3.rollup(
  quarterlySeverityDataStatic,
  v => v.length,
  d => d.quarter,
  d => d.severity
);

const stackedDataStatic = last10Years.map(q => {
  const sevMap = severityGroupedStatic.get(q) || new Map();
  return {
    quarter: q,
    low: sevMap.get('low') || 0,
    medium: sevMap.get('medium') || 0,
    high: sevMap.get('high') || 0
  };
});

stackedDataStatic
```

```js
// Stacked bar chart for quarterly incident severity (static)
Plot.plot({
  title: "Quarterly Incident Severity (Stacked, Last 10 Years)",
  width: 1200,
  height: 500,
  marginLeft: 80,
  marginBottom: 100,
  x: {
    label: "Quarter",
    tickRotate: -45,
    domain: stackedDataStatic.map(d => d.quarter)
  },
  y: {
    label: "Number of Incidents",
    grid: true,
    nice: true,
    zero: true
  },
  marks: [
    Plot.barY(stackedDataStatic, {
      x: "quarter",
      y: "low",
      fill: severityColors.low,
      title: d => `${d.quarter} Low: ${d.low}`
    }),
    Plot.barY(stackedDataStatic, {
      x: "quarter",
      y: "medium",
      fill: severityColors.medium,
      title: d => `${d.quarter} Medium: ${d.medium}`,
      offset: d => d.low
    }),
    Plot.barY(stackedDataStatic, {
      x: "quarter",
      y: "high",
      fill: severityColors.high,
      title: d => `${d.quarter} High: ${d.high}`,
      offset: d => d.low + d.medium
    }),
    Plot.ruleY([0])
  ]
})
```

## Average Daily Ridership by Station (76 Days)

```js
// Calculate average daily ridership per station from final_combined_dataset
const stationRidership = d3.rollups(
  final_combined_dataset,
  v => d3.mean(v, d => (d.entrances + d.exits)),
  d => d.station
).map(([station, avgRidership]) => ({ station, avgRidership }));

// Sort stations by average ridership ascending (lowest left, highest right)
stationRidership.sort((a, b) => a.avgRidership - b.avgRidership);

stationRidership
```

```js
// Bar chart: x-axis = station, y-axis = average daily ridership
Plot.plot({
  title: "Average Daily Ridership by Station (76 Days)",
  width: 1200,
  height: 500,
  marginLeft: 80,
  marginBottom: 120,
  x: {
    label: "Station",
    domain: stationRidership.map(d => d.station),
    tickRotate: -60
  },
  y: {
    label: "Average Daily Ridership",
    grid: true,
    nice: true,
    zero: true
  },
  marks: [
    Plot.barY(stationRidership, {
      x: "station",
      y: "avgRidership",
      fill: "#2563eb",
      title: d => `${d.station}: ${Math.round(d.avgRidership)}`
    }),
    Plot.ruleY([0])
  ]
})
```

## Expected Attendance by Station (75 Days)

```js
// Get station order from average daily ridership chart
const stationOrder = stationRidership.map(d => d.station);

// Calculate twice the total event attendance per station, zero if missing
const stationAttendance = d3.rollups(
  final_combined_dataset,
  v => d3.sum(v, d => (typeof d.total_event_attendance === 'number' && !isNaN(d.total_event_attendance)) ? 2 * d.total_event_attendance : 0),
  d => d.station
).map(([station, totalAttendance]) => ({ station, totalAttendance }));

// Ensure all stations from stationOrder are present, fill missing with zero
const stationAttendanceAligned = stationOrder.map(station => {
  const found = stationAttendance.find(d => d.station === station);
  return found ? found : { station, totalAttendance: 0 };
});

stationAttendanceAligned
```

```js
// Bar chart: x-axis = station (aligned), y-axis = twice total event attendance
Plot.plot({
  title: "Twice Total Event Attendance by Station (75 Days)",
  width: 1200,
  height: 500,
  marginLeft: 80,
  marginBottom: 120,
  x: {
    label: "Station",
    domain: stationAttendanceAligned.map(d => d.station),
    tickRotate: -60
  },
  y: {
    label: "Twice Total Event Attendance",
    grid: true,
    nice: true,
    zero: true
  },
  marks: [
    Plot.barY(stationAttendanceAligned, {
      x: "station",
      y: "totalAttendance",
      fill: "#16a34a",
      title: d => `${d.station}: ${d.totalAttendance}`
    }),
    Plot.ruleY([0])
  ]
})
```

## Incident Response Time Scatter Chart by Station

```js
// Prepare data for scatter chart from incidents dataset
const incidentSeverityColors = {
  low: '#ca8a04',    // yellow
  medium: '#ea580c', // orange
  high: '#dc2626'    // red
};

const scatterIncidents = incidents.map(d => ({
  station: d.station,
  response_time: (typeof d.response_time_minutes === 'number' && !isNaN(d.response_time_minutes)) ? d.response_time_minutes : 0,
  staffing: (typeof d.staffing_count === 'number' && !isNaN(d.staffing_count)) ? d.staffing_count : 1,
  severity: d.severity || 'low'
}));

// Use stationOrder from previous cells (do not redefine)
scatterIncidents
```

```js
// Scatter chart: x = station, y = response_time_minutes, size = staffing_count, color = severity
Plot.plot({
  title: "Incident Response Time by Station (10 Years)",
  width: 1200,
  height: 600,
  marginLeft: 80,
  marginBottom: 120,
  x: {
    label: "Station",
    domain: stationOrder,
    tickRotate: -60
  },
  y: {
    label: "Incident Response Time (minutes)",
    grid: true,
    nice: true,
    zero: true
  },
  color: {
    legend: true,
    domain: ["low", "medium", "high"],
    range: [incidentSeverityColors.low, incidentSeverityColors.medium, incidentSeverityColors.high],
    label: "Incident Severity"
  },
  r: {
    legend: true,
    label: "Incident Staffing (dot size)"
  },
  marks: [
    Plot.dot(scatterIncidents, {
      x: "station",
      y: "response_time",
      r: d => Math.max(8, d.staffing * 6), // Exaggerate dot size for higher staffing
      fill: d => incidentSeverityColors[d.severity] || "#888",
      fillOpacity: 0.7,
      stroke: "#222",
      title: d => `${d.station}\nResponse Time: ${d.response_time}\nStaffing: ${d.staffing}\nSeverity: ${d.severity}`
    })
  ]
})
```


