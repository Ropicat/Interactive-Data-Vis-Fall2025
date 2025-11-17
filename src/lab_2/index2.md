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
