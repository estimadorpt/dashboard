---
title: Portuguese Election Forecast Model
theme: air
toc: false
---

# Portuguese Election Forecast: District Map

```js
// Standard components
import { districtMap } from "./components/district-map.js";
import { nationalTrendsChart } from "./components/national-trends-chart.js";
// Placeholder components
import { seatProjection } from "./components/seat-projection.js";
import { coalitionGauge } from "./components/coalition-gauge.js";
// REMOVE OLD diagnostics placeholder import
// import { pollsterDiagnostics } from "./components/pollster-diagnostics.js"; 
// Remove placeholder import
// import { contestedBarsPlaceholder } from "./components/contested-bars-placeholder.js";
// Map sidebar component - No longer imported directly here
// import { mapSidebar } from "./components/map-sidebar.js";
// NEW Combined Component
import { mapWithSidebar } from "./components/mapWithSidebar.js"; 
// REMOVE OLD Imports
// import { contestedTable } from "./components/contested-table.js";
// import { contestedBarsPlaceholder } from "./components/contested-bars-placeholder.js";
// Import the NEW combined section component
import { contestedSeatsSection } from "./components/contested-seats-section.js";
// Import the NEW house effects heatmap component
import { houseEffectsHeatmap } from "./components/house-effects-heatmap.js";

// Data loaders
const portugalTopoJson = await FileAttachment("data/Portugal-Distritos-Ilhas_TopoJSON.json").json();
const nationalTrends = await FileAttachment("data/national_trends.json").json({typed: true});
const districtForecastData = await FileAttachment("./data/district_forecast.json").json({typed: true});
const contestedSeatsData = await FileAttachment("data/sample_contested_seats.json").json();
const seatProjectionData = await FileAttachment("data/sample_seat_forecast.json").json();
// REMOVE OLD poll error data (or keep if used elsewhere, but not by heatmap)
// const pollErrorData = await FileAttachment("data/sample_poll_errors.json").json(); 
// Load NEW house effects data
const houseEffectsData = await FileAttachment("data/house_effect.json").json();


// Prepare map data
const mappedForecastData = districtForecastData.map(d => ({...d, district_id: d.NAME_1}));

// --- Remove Reactive State for Sidebar --- 
// mutable hoveredDistrictData = null; 

// Remove event listener block if it exists
// ```js ... listeners ... ``` 
```

<!-- Row 1: Seat Projection -->
<div class="grid grid-cols-2 gap-4">
  <div class="card p-4">
    <h2>Seat Projection</h2>
    ${seatProjection(seatProjectionData)}
  </div>
  <div class="card p-4">
    <h2>Coalition Gauge</h2>
    ${resize((width) => coalitionGauge(seatProjectionData, {width}))}
  </div>
</div>

<!-- Row 2: Combined Map and Sidebar -->
<div class="card grid-colspan-2 p-4">
    <h2>District Forecast & Details</h2>
    ${mapWithSidebar(portugalTopoJson, mappedForecastData)}
</div>
  
<!-- Row 3: Combined Contested Seats Section -->
<div class="grid-colspan-2">
    ${contestedSeatsSection(contestedSeatsData)}
</div>


<!-- Row 4: National Trends and Diagnostics -->
<div class="grid grid-cols-2 gap-4">
  <div class="card p-4">
    <h2>National Vote Intention</h2>
    <p class="small note">Modeled national vote share for major parties over time.</p>
    ${resize((width) => nationalTrendsChart(nationalTrends, {width}))}
  </div>
  <div class="card p-4" style="display: flex; flex-direction: column; justify-content: flex-start;">
    <h2>Pollster House-Effects</h2> 
    <div> 
      ${resize(width => houseEffectsHeatmap(houseEffectsData, { width }))}
    </div>
  </div>
</div>

<!-- Methodology -->
<details class="py-4">
  <summary>Methodology</summary>
  <div class="card p-4">
    <p>(Placeholder for methodology explanation)</p>
  </div>
</details>

<!-- Footer -->
<div class="small note py-4">Model and visualizations developed by [Your Name/Organization]. Last updated: ${new Date().toLocaleDateString()}.</div>
