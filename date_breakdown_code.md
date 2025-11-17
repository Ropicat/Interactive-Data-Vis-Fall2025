## Enhanced Dataset with Date Breakdown

Let's enhance our combined dataset by breaking down the date column into separate calendar date and day of week columns.

```js
// Create enhanced dataset with date breakdown
const incidents_ridership_events_enhanced = incidents_ridership_events_combined.map(record => {
  // Parse the date string to a Date object
  const dateObj = new Date(record.date);
  
  // Create calendar date in MM-DD-YYYY format
  const calendarDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}-${dateObj.getFullYear()}`;
  
  // Get day of the week (full name)
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  
  return {
    ...record,
    calendar_date: calendarDate,
    day_of_week: dayOfWeek
  };
});

// Show sample of enhanced data
console.log("Enhanced dataset sample:", incidents_ridership_events_enhanced.slice(0, 5).map(d => ({
  original_date: d.date,
  calendar_date: d.calendar_date,
  day_of_week: d.day_of_week,
  station: d.station,
  total_ridership: d.total_ridership
})));
```

```js
// Display enhanced dataset table with date breakdown
Inputs.table(incidents_ridership_events_enhanced.slice(0, 50), {
  columns: [
    "calendar_date", 
    "day_of_week", 
    "station", 
    "entrances", 
    "exits", 
    "total_ridership", 
    "incident_count", 
    "event_count"
  ],
  header: {
    calendar_date: "Calendar Date (MM-DD-YYYY)",
    day_of_week: "Day of Week",
    station: "Station",
    entrances: "Entrances",
    exits: "Exits", 
    total_ridership: "Total Ridership",
    incident_count: "Incidents",
    event_count: "Local Events"
  },
  width: {
    calendar_date: 150,
    day_of_week: 120,
    station: 200,
    entrances: 100,
    exits: 100,
    total_ridership: 130,
    incident_count: 100,
    event_count: 120
  },
  layout: "auto"
})
```