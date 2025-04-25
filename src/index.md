---
title: Portuguese Election Forecast Model
theme: dashboard
toc: false
---

# Portuguese Election Forecast: District Map

This map shows the current forecast for the leading party in each electoral district based on our dynamic Bayesian model.

```js
// Import the map component
import { districtMap } from "./components/district-map.js";
// Remove direct loader import
// import districtForecastLoader from "./data/district_forecast.csv.js"; 
```

```js
// Load TopoJSON
const portugalTopoJson = await FileAttachment("data/Portugal-Distritos-Ilhas_TopoJSON.json").json();

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

## Methodology

(Placeholder for methodology explanation - we can add content from your description later)

## National Trends

(Placeholder for national trends chart)

## Seat Forecast

(Placeholder for seat forecast chart)

<div class="small note">Model and visualizations developed by [Your Name/Organization]. Last updated: ${new Date().toLocaleDateString()}.</div>
