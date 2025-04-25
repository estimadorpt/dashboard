---
title: Portuguese Election Forecast Model
theme: dashboard
toc: false
---

# Portuguese Election Forecast: District Map

This map shows the current forecast for the leading party in each electoral district based on our dynamic Bayesian model.

```js
// Import the map component AND the new chart component
import { districtMap } from "./components/district-map.js";
import { nationalTrendsChart } from "./components/national-trends-chart.js";
// Remove direct loader import
// import districtForecastLoader from "./data/district_forecast.csv.js"; 
```

```js
// Load TopoJSON
const portugalTopoJson = await FileAttachment("data/Portugal-Distritos-Ilhas_TopoJSON.json").json();

// Load National Trends data using its loader
const nationalTrends = await FileAttachment("data/national_trends.csv").csv({typed: true});

// Define a block to load data implicitly via loader and generate map
const districtMapPlot = (async () => { 
  // Use FileAttachment on the *target* file, which triggers the loader
  const districtForecastData = await FileAttachment("./data/district_forecast.csv").csv({typed: true}); 
  // console.log("Data via FileAttachment (post-loader):", districtForecastData);
  
  if (!districtForecastData || districtForecastData.length === 0) {
    console.error("FileAttachment did not return valid data! Check loader output and Framework logs.");
    return document.createElement("div");
  }
  
  // Rename NAME_1 to district_id for the component
  const mappedForecastData = districtForecastData.map(d => ({...d, district_id: d.NAME_1}));
  // console.log("Mapped forecast data for component:", mappedForecastData);
  
  // Return the result of the map component call
  return districtMap(portugalTopoJson, mappedForecastData); 
})();
```

<div class="card">
  <h2>District Forecast Map</h2>
  <p>Color indicates the party predicted to receive the most votes. Hover over a district for detailed forecasts (mean and 95% credible interval).</p>
  <figure>
    // Embed the generated plot variable here
    ${districtMapPlot}
    <figcaption>Note: Forecasts for Açores and Madeira represent the entire autonomous region.</figcaption>
  </figure>
</div>

## National Trends

<div class="card">
  <h2>National Vote Intention</h2>
  <p>Modeled national vote share for major parties over time, including 95% credible intervals.</p>
  <figure>
    ${resize((width) => nationalTrendsChart(nationalTrends, {width}))}
  </figure>
</div>

## Methodology

(Placeholder for methodology explanation - we can add content from your description later)

## Seat Forecast

(Placeholder for seat forecast chart)

<div class="small note">Model and visualizations developed by [Your Name/Organization]. Last updated: ${new Date().toLocaleDateString()}.</div>
