---
title: "Lab 2: Subway Staffing"
toc: true
---

This page is where you can iterate. Follow the lab instructions in the [readme.md](./README.md).


<!-- Import Data -->
const incidents = FileAttachment("./data/incidents.csv").csv({ typed: true })
const local_events = FileAttachment("./data/local_events.csv").csv({ typed: true })
const upcoming_events = FileAttachment("./data/upcoming_events.csv").csv({ typed: true })
const ridership = FileAttachment("./data/ridership.csv").csv({ typed: true })

incidents.slice(0,5)

local_events.slice(0,5)

upcoming_events.slice(0,5)

ridership.slice(0,5)

<!-- Include current staffing counts from the prompt -->

const currentStaffing = {
  "Times Sq-42 St": 19,
  "Grand Central-42 St": 18,
  "34 St-Penn Station": 15,
  "14 St-Union Sq": 4,
  "Fulton St": 17,
  "42 St-Port Authority": 14,
  "Herald Sq-34 St": 15,
  "Canal St": 4,
  "59 St-Columbus Circle": 6,
  "125 St": 7,
  "96 St": 19,
  "86 St": 19,
  "72 St": 10,
  "66 St-Lincoln Center": 15,
  "50 St": 20,
  "28 St": 13,
  "23 St": 8,
  "Christopher St": 15,
  "Houston St": 18,
  "Spring St": 12,
  "Chambers St": 18,
  "Wall St": 9,
  "Bowling Green": 6,
  "West 4 St-Wash Sq": 4,
  "Astor Pl": 7
}

<!-- Combine incidents with ridership data using date and station as keys -->
// Create a combined dataset joining incidents and ridership by date and station
const incidents_ridership_combined = Array.from(
  d3.group(ridership, d => `${d.date}_${d.station}`),
  ([key, ridership_records]) => {
    const [date, station] = key.split('_');
    
    // Find matching incidents for this date and station with more flexible matching
    const matching_incidents = incidents.filter(incident => {
      const incidentDate = incident.date ? incident.date.toString().trim() : "";
      const incidentStation = incident.station ? incident.station.toString().trim() : "";
      const ridershipDate = date ? date.toString().trim() : "";
      const ridershipStation = station ? station.toString().trim() : "";
      
      return incidentStation === ridershipStation && incidentDate === ridershipDate;
    });
    
    // Get ridership data (should be one record per date-station)
    const ridership_data = ridership_records[0];
    
    // Combine the data
    return {
      date: date,
      station: station,
      entrances: ridership_data.entrances,
      exits: ridership_data.exits,
      total_ridership: ridership_data.entrances + ridership_data.exits,
      incident_count: matching_incidents.length,
      incidents: matching_incidents,
      has_incidents: matching_incidents.length > 0,
      // Calculate incident statistics if there are incidents
      avg_response_time: matching_incidents.length > 0 ? 
        d3.mean(matching_incidents, d => d.response_time_minutes) : null,
      // Add severity information
      severities: matching_incidents.map(d => d.severity), // Array of all severities for this date-station
      primary_severity: matching_incidents.length > 0 ? 
        matching_incidents.reduce((prev, current) => {
          // Prioritize high > medium > low
          const priority = { high: 3, medium: 2, low: 1 };
          return (priority[current.severity] || 0) > (priority[prev.severity] || 0) ? current : prev;
        }).severity : null,
      // Add staffing information from incidents
      staff_at_incident: matching_incidents.length > 0 ? 
        (matching_incidents[0].staff_count || matching_incidents[0].staffing || matching_incidents[0].staff || currentStaffing[station]) : 
        currentStaffing[station] || null,
      severity_counts: {
        high: matching_incidents.filter(d => d.severity === 'high').length,
        medium: matching_incidents.filter(d => d.severity === 'medium').length,
        low: matching_incidents.filter(d => d.severity === 'low').length
      }
    };
  }
).filter(d => d.date && d.station) // Remove any invalid records

// Create a NEW combined dataset that includes local events data
const incidents_ridership_events_combined = incidents_ridership_combined.map(record => {
  // DEBUG: Let's check what fields are actually available in local events
  if (Math.random() < 0.001) { // Log occasionally to avoid spam
    console.log("Sample local event record:", local_events[0]);
    console.log("Local events fields:", Object.keys(local_events[0] || {}));
  }
  
  // Find matching local events for this date and station
  // Try multiple possible field name combinations
  const matching_events = local_events.filter(event => {
    const eventDate = event.date || event.event_date || "";
    const eventStation = event.nearby_station || event.station || event.station_name || "";
    const recordDate = record.date || "";
    const recordStation = record.station || "";
    
    // Convert to strings and normalize
    const eDateStr = eventDate.toString().trim().toLowerCase();
    const eStationStr = eventStation.toString().trim().toLowerCase();
    const rDateStr = recordDate.toString().trim().toLowerCase();
    const rStationStr = recordStation.toString().trim().toLowerCase();
    
    const dateMatch = eDateStr === rDateStr;
    const stationMatch = eStationStr === rStationStr;
    
    // Debug matching occasionally
    if (Math.random() < 0.001 && (dateMatch || stationMatch)) {
      console.log("Potential match found:", {
        eventDate: eDateStr, recordDate: rDateStr, dateMatch,
        eventStation: eStationStr, recordStation: rStationStr, stationMatch
      });
    }
    
    return dateMatch && stationMatch;
  });
  
  // Add local events information to the existing record
  return {
    ...record, // Keep all existing fields
    // Add event-related fields
    event_count: matching_events.length,
    has_events: matching_events.length > 0,
    events: matching_events,
    total_estimated_attendance: matching_events.length > 0 ? 
      d3.sum(matching_events, d => d.estimated_attendance || d.attendance || d.expected_attendance || 0) : 0,
    event_types: matching_events.map(d => d.event_type || d.type || d.category || "Unknown"),
    nearby_station: matching_events.length > 0 ? 
      (matching_events[0].nearby_station || matching_events[0].station || matching_events[0].station_name) : record.station
  };
})
```

```js
// SPECIFIC DEBUG: Local Events Analysis
console.log("=== LOCAL EVENTS DEBUG ===");
console.log("Total local_events records:", local_events.length);
console.log("First 3 local events:", local_events.slice(0, 3));
console.log("Local events field names:", Object.keys(local_events[0] || {}));

// Check specific field names and values
console.log("Local events dates (first 10):", local_events.slice(0, 10).map(d => d.date || d.event_date || "NO_DATE"));
console.log("Local events stations (first 10):", local_events.slice(0, 10).map(d => d.nearby_station || d.station || d.station_name || "NO_STATION"));
console.log("Local events attendance (first 10):", local_events.slice(0, 10).map(d => d.estimated_attendance || d.attendance || "NO_ATTENDANCE"));

// Check date and station formats from both datasets
console.log("Sample ridership dates:", ridership.slice(0, 5).map(d => d.date));
console.log("Sample ridership stations:", ridership.slice(0, 5).map(d => d.station));

// Test manual matching
const testRecord = incidents_ridership_combined[0];
console.log("Test record for matching:", testRecord);
const testMatches = local_events.filter(event => {
  const eventDate = (event.date || event.event_date || "").toString().trim().toLowerCase();
  const eventStation = (event.nearby_station || event.station || event.station_name || "").toString().trim().toLowerCase();
  const recordDate = (testRecord.date || "").toString().trim().toLowerCase();
  const recordStation = (testRecord.station || "").toString().trim().toLowerCase();
  return eventDate === recordDate && eventStation === recordStation;
});
console.log("Manual test matches for first record:", testMatches.length);

// Check if any events have matching stations (ignore date for now)
const stationMatches = local_events.filter(event => {
  const eventStation = (event.nearby_station || event.station || event.station_name || "").toString().trim().toLowerCase();
  return incidents_ridership_combined.some(record => 
    (record.station || "").toString().trim().toLowerCase() === eventStation
  );
});
console.log("Events with matching stations (any date):", stationMatches.length);
```

```js
// DEBUG: Check the data formats and joining
console.log("Sample incidents data:", incidents.slice(0, 3));
console.log("Sample ridership data:", ridership.slice(0, 3));
console.log("Total incidents records:", incidents.length);
console.log("Total ridership records:", ridership.length);
console.log("Combined dataset length:", incidents_ridership_combined.length);

// Check incident date/station formats
console.log("Incident dates sample:", incidents.slice(0, 5).map(d => d.date));
console.log("Incident stations sample:", incidents.slice(0, 5).map(d => d.station));
console.log("Ridership dates sample:", ridership.slice(0, 5).map(d => d.date)); 
console.log("Ridership stations sample:", ridership.slice(0, 5).map(d => d.station));

// Count records with incidents
const withIncidents = incidents_ridership_combined.filter(d => d.incident_count > 0);
console.log("Records with incidents:", withIncidents.length);
console.log("Sample combined record with incidents:", withIncidents[0]);

// DEBUG: Check staffing data specifically
console.log("Sample incident record fields:", incidents.slice(0, 1)[0]);
console.log("Available incident fields:", Object.keys(incidents[0] || {}));
console.log("Checking for staff_count field in incidents:", incidents.slice(0, 3).map(d => d.staff_count));
console.log("Current staffing object sample:", Object.entries(currentStaffing).slice(0, 3));
console.log("Staff at incident values in combined data:", withIncidents.slice(0, 3).map(d => d.staff_at_incident));

// DEBUG: Check local events data and new combined dataset
console.log("Sample local events data:", local_events.slice(0, 3));
console.log("Available local events fields:", Object.keys(local_events[0] || {}));
console.log("Local events dates sample:", local_events.slice(0, 5).map(d => d.date));
console.log("Local events nearby stations sample:", local_events.slice(0, 5).map(d => d.nearby_station));
console.log("Total local events records:", local_events.length);
console.log("New combined dataset length:", incidents_ridership_events_combined.length);

// Count records with events
const withEvents = incidents_ridership_events_combined.filter(d => d.event_count > 0);
console.log("Records with local events:", withEvents.length);
console.log("Sample record with events:", withEvents[0]);
```

```js
// Find the first and second incidents in the dataset
const recordsWithIncidents = incidents_ridership_combined.filter(d => d.has_incidents && d.incident_count > 0);

console.log(`Total records with incidents: ${recordsWithIncidents.length}`);

// Show the first incident
const firstIncident = recordsWithIncidents[0];
console.log("First incident record:", firstIncident);

// Show the second incident  
const secondIncident = recordsWithIncidents[1];
console.log("Second incident record:", secondIncident);

// Display both as a table
Inputs.table([firstIncident, secondIncident], {
  columns: ["date", "station", "entrances", "exits", "total_ridership", "incident_count", "staff_at_incident", "primary_severity", "has_incidents", "avg_response_time"],
  header: {
    date: "Date",
    station: "Station",
    entrances: "Entrances", 
    exits: "Exits",
    total_ridership: "Total Ridership",
    incident_count: "Incident Count",
    staff_at_incident: "Staff# at the time of Incident",
    primary_severity: "Primary Severity",
    has_incidents: "Has Incidents",
    avg_response_time: "Avg Response Time (min)"
  },
  width: {
    date: 120,
    station: 200,
    entrances: 100,
    exits: 100,
    total_ridership: 150,
    incident_count: 100,
    staff_at_incident: 180,
    primary_severity: 120,
    has_incidents: 120,
    avg_response_time: 180
  }
})
```

```js
// Display only records with actual incidents (incident_count > 0) using Observable Framework
Inputs.table(incidents_ridership_combined.filter(d => d.incident_count > 0), {
  columns: ["date", "station", "entrances", "exits", "total_ridership", "incident_count", "staff_at_incident", "primary_severity", "has_incidents", "avg_response_time"],
  header: {
    date: "Date",
    station: "Station", 
    entrances: "Entrances",
    exits: "Exits",
    total_ridership: "Total Ridership",
    incident_count: "Incidents",
    staff_at_incident: "Staff# at the time of Incident",
    primary_severity: "Primary Severity",
    has_incidents: "Has Incidents",
    avg_response_time: "Avg Response Time (min)"
  },
  width: {
    date: 120,
    station: 200,
    entrances: 100,
    exits: 100,
    total_ridership: 150,
    incident_count: 100,
    staff_at_incident: 180,
    primary_severity: 120,
    has_incidents: 120,
    avg_response_time: 180
  },
  layout: "auto"
})
```

```js
// Display first 1000 rows of combined dataset (with or without incidents) using Observable Framework
Inputs.table(incidents_ridership_combined.slice(0, 1000), {
  columns: ["date", "station", "entrances", "exits", "total_ridership", "incident_count", "staff_at_incident", "primary_severity", "has_incidents", "avg_response_time"],
  header: {
    date: "Date",
    station: "Station", 
    entrances: "Entrances",
    exits: "Exits",
    total_ridership: "Total Ridership",
    incident_count: "Incidents",
    staff_at_incident: "Staff# at the time of Incident",
    primary_severity: "Primary Severity",
    has_incidents: "Has Incidents",
    avg_response_time: "Avg Response Time (min)"
  },
  width: {
    date: 120,
    station: 200,
    entrances: 100,
    exits: 100,
    total_ridership: 150,
    incident_count: 100,
    staff_at_incident: 180,
    primary_severity: 120,
    has_incidents: 120,
    avg_response_time: 180
  },
  layout: "auto"
})
```

```js
// Display NEW combined dataset with local events (first 100 rows)
Inputs.table(incidents_ridership_events_combined.slice(0, 100), {
  columns: ["date", "station", "entrances", "exits", "total_ridership", "incident_count", "staff_at_incident", "primary_severity", "event_count", "total_estimated_attendance", "has_incidents", "has_events", "avg_response_time"],
  header: {
    date: "Date",
    station: "Station", 
    entrances: "Entrances",
    exits: "Exits",
    total_ridership: "Total Ridership",
    incident_count: "Incidents",
    staff_at_incident: "Staff# at the time of Incident",
    primary_severity: "Primary Severity",
    event_count: "Local Events Count",
    total_estimated_attendance: "Event Attendance",
    has_incidents: "Has Incidents",
    has_events: "Has Local Events",
    avg_response_time: "Avg Response Time (min)"
  },
  width: {
    date: 120,
    station: 200,
    entrances: 100,
    exits: 100,
    total_ridership: 150,
    incident_count: 100,
    staff_at_incident: 180,
    primary_severity: 120,
    event_count: 120,
    total_estimated_attendance: 150,
    has_incidents: 120,
    has_events: 120,
    avg_response_time: 180
  },
  layout: "auto"
})
```

```js
// Display ONLY records with local events (event_count > 0) using Observable Framework
Inputs.table(incidents_ridership_events_combined.filter(d => d.event_count > 0), {
  columns: ["date", "station", "entrances", "exits", "total_ridership", "incident_count", "staff_at_incident", "primary_severity", "event_count", "total_estimated_attendance", "has_incidents", "has_events", "avg_response_time"],
  header: {
    date: "Date",
    station: "Station", 
    entrances: "Entrances",
    exits: "Exits",
    total_ridership: "Total Ridership",
    incident_count: "Incidents",
    staff_at_incident: "Staff# at the time of Incident",
    primary_severity: "Primary Severity",
    event_count: "Local Events Count",
    total_estimated_attendance: "Event Attendance",
    has_incidents: "Has Incidents",
    has_events: "Has Local Events",
    avg_response_time: "Avg Response Time (min)"
  },
  width: {
    date: 120,
    station: 200,
    entrances: 100,
    exits: 100,
    total_ridership: 150,
    incident_count: 100,
    staff_at_incident: 180,
    primary_severity: 120,
    event_count: 120,
    total_estimated_attendance: 150,
    has_incidents: 120,
    has_events: 120,
    avg_response_time: 180
  },
  layout: "auto"
})
```

```js
// Display records with BOTH incidents (not 0) AND exactly 1 local event using Observable Framework
Inputs.table(incidents_ridership_events_combined.filter(d => d.incident_count > 0 && d.event_count === 1), {
  columns: ["date", "station", "entrances", "exits", "total_ridership", "incident_count", "staff_at_incident", "primary_severity", "event_count", "total_estimated_attendance", "has_incidents", "has_events", "avg_response_time"],
  header: {
    date: "Date",
    station: "Station", 
    entrances: "Entrances",
    exits: "Exits",
    total_ridership: "Total Ridership",
    incident_count: "Incidents",
    staff_at_incident: "Staff# at the time of Incident",
    primary_severity: "Primary Severity",
    event_count: "Local Events Count",
    total_estimated_attendance: "Event Attendance",
    has_incidents: "Has Incidents",
    has_events: "Has Local Events",
    avg_response_time: "Avg Response Time (min)"
  },
  width: {
    date: 120,
    station: 200,
    entrances: 100,
    exits: 100,
    total_ridership: 150,
    incident_count: 100,
    staff_at_incident: 180,
    primary_severity: 120,
    event_count: 120,
    total_estimated_attendance: 150,
    has_incidents: 120,
    has_events: 120,
    avg_response_time: 180
  },
  layout: "auto"
})
```

## CSV Export for Excel

Create downloadable CSV files of your combined datasets:

```js
// Function to convert data to CSV format
function convertToCSV(data, filename) {
  if (!data || data.length === 0) {
    return "No data available for export";
  }
  
  // Get all unique keys from the data
  const allKeys = [...new Set(data.flatMap(Object.keys))];
  
  // Filter out complex objects/arrays for CSV compatibility
  const simpleKeys = allKeys.filter(key => {
    const sampleValue = data.find(row => row[key] !== undefined)?.[key];
    return sampleValue !== null && 
           typeof sampleValue !== 'object' && 
           !Array.isArray(sampleValue);
  });
  
  // Create CSV header
  const csvHeader = simpleKeys.join(',');
  
  // Create CSV rows
  const csvRows = data.map(row => {
    return simpleKeys.map(key => {
      const value = row[key];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  return [csvHeader, ...csvRows].join('\n');
}

// Create CSV content for the full combined dataset
const fullCombinedCSV = convertToCSV(incidents_ridership_events_combined, "full_combined_data");

// Create CSV content for records with incidents only  
const incidentsOnlyCSV = convertToCSV(
  incidents_ridership_events_combined.filter(d => d.incident_count > 0), 
  "incidents_only_data"
);

// Create CSV content for records with events only
const eventsOnlyCSV = convertToCSV(
  incidents_ridership_events_combined.filter(d => d.event_count > 0), 
  "events_only_data"
);

// Create CSV content for records with both incidents and exactly 1 event
const incidentsAndEventsCSV = convertToCSV(
  incidents_ridership_events_combined.filter(d => d.incident_count > 0 && d.event_count === 1), 
  "incidents_and_events_data"
);
```

// Simple CSV export using Observable Framework's built-in capabilities
// Create CSV content for each dataset
function arrayToCSV(data) {
  if (!data || data.length === 0) return "No data available";
  
  // Get headers (only simple data types)
  const headers = Object.keys(data[0]).filter(key => {
    const value = data[0][key];
    return typeof value !== 'object' || value === null;
  });
  
  // Create CSV rows
  const rows = data.map(row => 
    headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) value = '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

// Create the CSV data
const fullDataCSV = arrayToCSV(incidents_ridership_events_combined);
const incidentsCSV = arrayToCSV(incidents_ridership_events_combined.filter(d => d.incident_count > 0));
const eventsCSV = arrayToCSV(incidents_ridership_events_combined.filter(d => d.event_count > 0));
const bothCSV = arrayToCSV(incidents_ridership_events_combined.filter(d => d.incident_count > 0 && d.event_count === 1));

// DEBUG: Log CSV creation status
console.log("=== CSV FILE CREATION STATUS ===");
console.log("Full dataset CSV length:", fullDataCSV.length, "characters");
console.log("Full dataset preview (first 200 chars):", fullDataCSV.substring(0, 200) + "...");
console.log("Incidents CSV length:", incidentsCSV.length, "characters");
console.log("Events CSV length:", eventsCSV.length, "characters");  
console.log("Both CSV length:", bothCSV.length, "characters");
console.log("Data URI lengths:");
console.log("- Full:", `data:text/csv;charset=utf-8,${encodeURIComponent(fullDataCSV)}`.length);
console.log("- Incidents:", `data:text/csv;charset=utf-8,${encodeURIComponent(incidentsCSV)}`.length);
console.log("- Events:", `data:text/csv;charset=utf-8,${encodeURIComponent(eventsCSV)}`.length);
console.log("- Both:", `data:text/csv;charset=utf-8,${encodeURIComponent(bothCSV)}`.length);

// CSV Preview - Show first few lines of each CSV to verify content
html`
<div style="background: #fff3cd; padding: 15px; border-radius: 6px; border: 1px solid #ffeaa7; margin: 15px 0;">
  <h4 style="color: #856404; margin-top: 0;">🔍 CSV Content Verification</h4>
  <p style="color: #856404; font-size: 14px;">Preview the first few lines of each CSV file to verify they were created correctly:</p>
  
  <div style="font-family: monospace; font-size: 12px; background: white; padding: 10px; border-radius: 4px; margin: 10px 0; border: 1px solid #ddd;">
    <strong>Full Dataset (first 3 lines):</strong><br>
    <pre style="margin: 5px 0; white-space: pre-wrap; word-wrap: break-word;">${fullDataCSV.split('\n').slice(0, 3).join('\n')}</pre>
  </div>
  
  <div style="font-family: monospace; font-size: 12px; background: white; padding: 10px; border-radius: 4px; margin: 10px 0; border: 1px solid #ddd;">
    <strong>Incidents Only (first 3 lines):</strong><br>
    <pre style="margin: 5px 0; white-space: pre-wrap; word-wrap: break-word;">${incidentsCSV.split('\n').slice(0, 3).join('\n')}</pre>
  </div>
  
  <div style="font-family: monospace; font-size: 12px; background: white; padding: 10px; border-radius: 4px; margin: 10px 0; border: 1px solid #ddd;">
    <strong>Events Only (first 3 lines):</strong><br>
    <pre style="margin: 5px 0; white-space: pre-wrap; word-wrap: break-word;">${eventsCSV.split('\n').slice(0, 3).join('\n')}</pre>
  </div>
  
  <div style="font-family: monospace; font-size: 12px; background: white; padding: 10px; border-radius: 4px; margin: 10px 0; border: 1px solid #ddd;">
    <strong>Incidents + Events (first 3 lines):</strong><br>
    <pre style="margin: 5px 0; white-space: pre-wrap; word-wrap: break-word;">${bothCSV.split('\n').slice(0, 3).join('\n')}</pre>
  </div>
  
  <div style="margin-top: 15px; padding: 10px; background: #d1ecf1; border-radius: 4px; border-left: 4px solid #bee5eb;">
    <strong>✅ Status Check:</strong>
    <ul style="margin: 5px 0; padding-left: 20px; font-size: 14px;">
      <li>Full Dataset: ${fullDataCSV.length > 100 ? "✅ Generated" : "❌ Empty or too small"} (${fullDataCSV.length} chars)</li>
      <li>Incidents: ${incidentsCSV.length > 50 ? "✅ Generated" : "❌ Empty or too small"} (${incidentsCSV.length} chars)</li>
      <li>Events: ${eventsCSV.length > 50 ? "✅ Generated" : "❌ Empty or too small"} (${eventsCSV.length} chars)</li>
      <li>Both: ${bothCSV.length > 50 ? "✅ Generated" : "❌ Empty or too small"} (${bothCSV.length} chars)</li>
    </ul>
  </div>
</div>
`

// Display the download interface with data URIs
html`
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
  <h3 style="color: #495057; margin-top: 0;">📁 Download CSV Files for Excel</h3>
  <p style="color: #6c757d; margin-bottom: 20px;">Right-click and "Save link as..." to download CSV files:</p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
    
    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
      <h4 style="color: #007bff; margin: 0 0 8px 0;">📊 Full Combined Dataset</h4>
      <p style="color: #6c757d; font-size: 14px; margin: 0 0 12px 0;">
        ${incidents_ridership_events_combined.length.toLocaleString()} total records<br>
        <small>Complete dataset with all information</small>
      </p>
      <a href="data:text/csv;charset=utf-8,${encodeURIComponent(fullDataCSV)}" 
         download="subway_full_combined_data.csv"
         style="display: inline-block; background: #007bff; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px; width: calc(100% - 32px); text-align: center;">
        📥 Download Full Dataset
      </a>
    </div>
    
    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
      <h4 style="color: #dc3545; margin: 0 0 8px 0;">🚨 Incidents Only</h4>
      <p style="color: #6c757d; font-size: 14px; margin: 0 0 12px 0;">
        ${incidents_ridership_events_combined.filter(d => d.incident_count > 0).length.toLocaleString()} records with incidents<br>
        <small>Safety incidents and response data</small>
      </p>
      <a href="data:text/csv;charset=utf-8,${encodeURIComponent(incidentsCSV)}" 
         download="subway_incidents_only.csv"
         style="display: inline-block; background: #dc3545; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px; width: calc(100% - 32px); text-align: center;">
        📥 Download Incidents
      </a>
    </div>
    
    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
      <h4 style="color: #28a745; margin: 0 0 8px 0;">🎉 Local Events Only</h4>
      <p style="color: #6c757d; font-size: 14px; margin: 0 0 12px 0;">
        ${incidents_ridership_events_combined.filter(d => d.event_count > 0).length.toLocaleString()} records with events<br>
        <small>Local events impact analysis</small>
      </p>
      <a href="data:text/csv;charset=utf-8,${encodeURIComponent(eventsCSV)}" 
         download="subway_events_only.csv"
         style="display: inline-block; background: #28a745; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px; width: calc(100% - 32px); text-align: center;">
        📥 Download Events
      </a>
    </div>
    
    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
      <h4 style="color: #ffc107; margin: 0 0 8px 0;">⚡ Incidents + Events</h4>
      <p style="color: #6c757d; font-size: 14px; margin: 0 0 12px 0;">
        ${incidents_ridership_events_combined.filter(d => d.incident_count > 0 && d.event_count === 1).length.toLocaleString()} records<br>
        <small>Both incidents and events</small>
      </p>
      <a href="data:text/csv;charset=utf-8,${encodeURIComponent(bothCSV)}" 
         download="subway_incidents_and_events.csv"
         style="display: inline-block; background: #ffc107; color: #212529; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px; width: calc(100% - 32px); text-align: center;">
        📥 Download Combined
      </a>
    </div>
  
  </div>
  
  <div style="margin-top: 15px; padding: 12px; background: #e7f3ff; border-radius: 4px; border-left: 4px solid #007bff;">
    <strong>💡 How to download:</strong>
    <ul style="margin: 5px 0; padding-left: 20px; font-size: 14px;">
      <li><strong>Left-click:</strong> Opens download dialog (most browsers)</li>
      <li><strong>Right-click → "Save link as":</strong> Choose download location</li>
      <li><strong>Files open directly in Excel</strong> for immediate analysis</li>
    </ul>
  </div>
</div>
`
```

// ALTERNATIVE: Copy-Paste CSV Content for Excel
// If downloads don't work, you can copy this text directly into Excel
html`
<div style="background: #fff; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0;">
  <h3 style="color: #28a745; margin-top: 0;">📋 Alternative: Copy-Paste CSV Data</h3>
  <p style="color: #495057;">If the download buttons don't work, you can copy the CSV content below and paste it directly into Excel:</p>
  
  <div style="margin: 15px 0;">
    <h4 style="color: #007bff;">📊 COMPLETE Combined Dataset (ALL ${incidents_ridership_events_combined.length.toLocaleString()} rows)</h4>
    <div style="background: #fff3cd; padding: 10px; border-radius: 4px; margin-bottom: 10px; border-left: 4px solid #ffc107;">
      <strong>⚠️ Large Dataset Warning:</strong> This contains the entire combined dataset. It may take a few seconds to copy.
    </div>
    <button onclick="navigator.clipboard.writeText(\`${fullDataCSV}\`); alert('COMPLETE CSV data copied to clipboard! (' + ${fullDataCSV.split('\\n').length} + ' rows)')" 
            style="background: #007bff; color: white; border: none; padding: 12px 20px; border-radius: 4px; margin-bottom: 10px; cursor: pointer; font-weight: bold;">
      📋 Copy ENTIRE Dataset to Clipboard (${incidents_ridership_events_combined.length.toLocaleString()} rows)
    </button>
    <div style="font-size: 12px; color: #6c757d; margin-bottom: 10px;">
      <strong>Dataset size:</strong> ${fullDataCSV.length.toLocaleString()} characters | 
      <strong>Columns:</strong> ${fullDataCSV.split('\\n')[0].split(',').length} | 
      <strong>Rows:</strong> ${fullDataCSV.split('\\n').length.toLocaleString()}
    </div>
    <textarea readonly 
              style="width: 100%; height: 200px; font-family: monospace; font-size: 10px; background: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; border-radius: 4px;"
              onclick="this.select(); document.execCommand('copy'); alert('COMPLETE CSV content copied!')">
${fullDataCSV}
    </textarea>
  </div>
  
  <div style="margin: 15px 0;">
    <h4 style="color: #dc3545;">🚨 Complete Incidents Dataset (ALL incidents)</h4>
    <button onclick="navigator.clipboard.writeText(\`${incidentsCSV}\`); alert('Complete incidents CSV copied to clipboard!')" 
            style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-bottom: 10px; cursor: pointer;">
      📋 Copy ALL Incidents to Clipboard (${incidents_ridership_events_combined.filter(d => d.incident_count > 0).length.toLocaleString()} rows)
    </button>
    <textarea readonly 
              style="width: 100%; height: 120px; font-family: monospace; font-size: 10px; background: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; border-radius: 4px;"
              onclick="this.select(); document.execCommand('copy'); alert('Complete incidents CSV content copied!')">
${incidentsCSV}
    </textarea>
  </div>
  
  <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff;">
    <h5 style="margin-top: 0; color: #007bff;">📝 How to use in Excel:</h5>
    <ol style="margin: 5px 0; padding-left: 20px; font-size: 14px;">
      <li>Click "Copy to Clipboard" button above</li>
      <li>Open Excel and create a new worksheet</li>
      <li>Click on cell A1</li>
      <li>Press Ctrl+V to paste the data</li>
      <li>Excel should automatically separate the columns</li>
      <li>If needed: Data → Text to Columns → Delimited → Comma</li>
    </ol>
  </div>
</div>
`

## Data Dictionary

The combined dataset contains the following columns:

// Column descriptions for incidents_ridership_combined dataset
const columnDescriptions = [
  {
    column: "date",
    description: "Date of the ridership data (YYYY-MM-DD format)",
    type: "String",
    example: "2024-01-15"
  },
  {
    column: "station",
    description: "Name of the subway station or station complex",
    type: "String", 
    example: "14 St-Union Sq"
  },
  {
    column: "entrances",
    description: "Number of daily entrances at this station",
    type: "Number",
    example: "25234"
  },
  {
    column: "exits",
    description: "Number of daily exits at this station",
    type: "Number",
    example: "23456"
  },
  {
    column: "total_ridership",
    description: "Total daily ridership (entrances + exits)",
    type: "Number",
    example: "48690"
  },
  {
    column: "incident_count",
    description: "Total number of incidents at this station on this date (0 if no incidents)",
    type: "Number",
    example: "2"
  },
  {
    column: "has_incidents",
    description: "Boolean indicating if any incidents occurred at this station on this date",
    type: "Boolean",
    example: "true/false"
  },
  {
    column: "avg_response_time",
    description: "Average emergency response time in minutes for incidents on this date (null if no incidents)",
    type: "Number",
    example: "12.5"
  },
  {
    column: "staff_at_incident",
    description: "Number of staff members present at the station during the time of incident (from incident data or current staffing)",
    type: "Number",
    example: "15"
  },
  {
    column: "primary_severity",
    description: "The highest severity level among all incidents for this date-station (high > medium > low)",
    type: "String",
    example: "high"
  },
  {
    column: "severities",
    description: "Array of all severity levels for incidents on this date-station",
    type: "Array",
    example: "['high', 'medium']"
  },
  {
    column: "incidents",
    description: "Array of full incident objects for this date and station",
    type: "Array",
    example: "[{incident details...}]"
  },
  {
    column: "severity_counts",
    description: "Object with counts of incidents by severity level (high, medium, low)",
    type: "Object", 
    example: "{high: 1, medium: 1, low: 0}"
  },
  {
    column: "event_count",
    description: "Number of local events occurring near this station on this date",
    type: "Number",
    example: "2"
  },
  {
    column: "has_events",
    description: "Boolean indicating if any local events occurred near this station on this date",
    type: "Boolean",
    example: "true/false"
  },
  {
    column: "total_estimated_attendance",
    description: "Total estimated attendance for all local events near this station on this date",
    type: "Number",
    example: "15000"
  },
  {
    column: "event_types",
    description: "Array of event types occurring near this station on this date",
    type: "Array",
    example: "['Concert', 'Sports Event']"
  },
  {
    column: "events",
    description: "Array of full local event objects for this date and nearby station",
    type: "Array",
    example: "[{event details...}]"
  }
];



