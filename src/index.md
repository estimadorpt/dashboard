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
import { pollsterDiagnostics } from "./components/pollster-diagnostics.js";
import { contestedBarsPlaceholder } from "./components/contested-bars-placeholder.js";
// Map sidebar component
import { mapSidebar } from "./components/map-sidebar.js";
// Contested seats table component
import { contestedTable } from "./components/contested-table.js";

// Data loaders
const portugalTopoJson = await FileAttachment("data/Portugal-Distritos-Ilhas_TopoJSON.json").json();
const nationalTrends = await FileAttachment("data/national_trends.json").json({typed: true});
const districtForecastData = await FileAttachment("./data/district_forecast.json").json({typed: true});
const contestedSeatsData = await FileAttachment("data/sample_contested_seats.json").json();
const seatProjectionData = await FileAttachment("data/sample_seat_forecast.json").json();
const pollErrorData = await FileAttachment("data/sample_poll_errors.json").json();

// Prepare map data
const mappedForecastData = districtForecastData.map(d => ({...d, district_id: d.NAME_1}));
```

<div class="grid gap-4 grid-cols-2">
  <!-- Row 1 -->
  <div class="card p-4">
    <h2>Seat Projection</h2>
    ${seatProjection(seatProjectionData)}
  </div>
  <div class="card p-4">
    <h2>Coalition Gauge</h2>
    ${coalitionGauge()}
  </div>
</div>

<div class="grid gap-4 grid-cols-2">
  <!-- Row 2: Map and Sidebar in separate cards -->
  <div class="card p-4">
    <h2>District Forecast</h2>
    <div>
      ${resize((width) => districtMap(portugalTopoJson, mappedForecastData, {width: Math.min(width, 700)}))}
      <figcaption class="small note">Note: Forecasts for Açores and Madeira represent the entire autonomous region.</figcaption>
    </div>
  </div>
  <div class="card p-4">
    <h2>Legend & Details</h2>
    ${mapSidebar()}
  </div>
</div>
  
<div class="grid gap-4 grid-cols-2">
  <!-- Row 3: Contested Seats Table and Placeholder -->
  <div class="card p-4">
    <h2>Contested Seats</h2>
    ${contestedTable(contestedSeatsData)}
  </div>
   <div class="card p-4">
    <h2>Contested Details</h2>
    ${contestedBarsPlaceholder()}
  </div>
</div>

<div class="grid gap-4 grid-cols-2">
  <!-- Row 4: National Trends and Diagnostics -->
  <div class="card p-4">
    <h2>National Vote Intention</h2>
    <p class="small note">Modeled national vote share for major parties over time.</p>
    ${resize((width) => nationalTrendsChart(nationalTrends, {width}))}
  </div>
  <div class="card p-4">
    <h2>Pollster Diagnostics</h2>
    ${pollsterDiagnostics(pollErrorData)}
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

```css
/* Target the main grid container specifically using its ID */
#main-grid {
  grid-auto-rows: auto; /* Allow rows to size based on content */
}
```
