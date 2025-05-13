---
title: Portuguese Election Forecast Model # Initial title, will be updated by JS
theme: air
toc: false
---

```js
// Import translations using standard ES module import syntax
import { T as enStrings } from "./locales/en.js";
import { T as ptStrings } from "./locales/pt.js";

// Language detection logic
const preferredLang = (() => {
  if (typeof window !== "undefined") { // Ensure window context for URLSearchParams and navigator
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam === 'pt' || langParam === 'en') {
      return langParam;
    }
    if (typeof navigator !== "undefined" && navigator.language) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'pt') return 'pt';
    }
  }
  return 'pt'; // Default to Portuguese
})();

// Define globally accessible variables for this page context
const currentLang = preferredLang;
const strings = currentLang === 'pt' ? ptStrings : enStrings;
```

```js
// Side effect cell to update document properties
// This cell uses 'strings' and 'currentLang' defined in the block above.
if (typeof document !== "undefined") {
  document.title = strings.title;
  document.documentElement.lang = currentLang;

  let ogTitleMeta = document.querySelector('meta[property="og:title"]');
  if (ogTitleMeta) {
    ogTitleMeta.setAttribute('content', strings.title);
  } else {
    ogTitleMeta = document.createElement('meta');
    ogTitleMeta.setAttribute('property', 'og:title');
    ogTitleMeta.setAttribute('content', strings.title);
    document.head.appendChild(ogTitleMeta);
  }

  let ogLocaleMeta = document.querySelector('meta[property="og:locale"]');
  if (!ogLocaleMeta) {
    ogLocaleMeta = document.createElement('meta');
    ogLocaleMeta.setAttribute('property', 'og:locale');
    document.head.appendChild(ogLocaleMeta);
  }
  ogLocaleMeta.setAttribute('content', currentLang === 'pt' ? 'pt_PT' : 'en_US');

  // Ensure twitter:card is present if not already handled by global config (optional, for robustness)
  // Though, it's best defined globally in observablehq.config.js as you've done.
  // If you are certain it's always in the global config, this specific check can be removed.
  let twitterCardMeta = document.querySelector('meta[name="twitter:card"]');
  if (!twitterCardMeta) {
    console.warn("twitter:card meta tag not found, consider adding it to observablehq.config.js head for optimal sharing.");
    // twitterCardMeta = document.createElement('meta');
    // twitterCardMeta.setAttribute('name', 'twitter:card');
    // twitterCardMeta.setAttribute('content', 'summary_large_image');
    // document.head.appendChild(twitterCardMeta);
  }
}
```

# ${strings.title}
<p class="text-muted text-sm">Last model run: ${new Date().toUTCString()}</p>

<!-- UPDATED HERO PROBABILITIES SECTION - TWO ROWS -->
<div id="hero-strip" style="margin-bottom: 2rem; padding: 1rem 0; border-top: 1px solid var(--theme-foreground-faint); border-bottom: 1px solid var(--theme-foreground-faint);">
  <!-- Row 1: Bloc Probabilities -->
  <div style="display: flex; flex-wrap: wrap; justify-content: space-around; align-items: flex-start; text-align: center; gap: 1rem; margin-bottom: 1rem;">
    <div style="min-width: 150px; flex: 1 1 150px;">
      <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${formatProbabilityPercent(probLeftMajority)}</p>
      <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">${strings.heroLeftMajorityProb}<br><span style="font-size: 0.8em;">${strings.heroLeftMajorityCondition}</span></p>
    </div>
    <div style="min-width: 150px; flex: 1 1 150px;">
      <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${formatProbabilityPercent(probRightMajority)}</p>
      <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">${strings.heroRightMajorityProb}<br><span style="font-size: 0.8em;">${strings.heroRightMajorityCondition}</span></p>
    </div>
    <div style="min-width: 150px; flex: 1 1 150px;">
      <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${formatProbabilityPercent(1 - probLeftMajority - probRightMajority)}</p>
      <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">${strings.heroNoMajorityProb}<br><span style="font-size: 0.8em;">${strings.heroNoMajorityCondition}</span></p>
    </div>
  </div>
  <!-- Row 2: Party Most Seats Probabilities -->
  <div style="display: flex; flex-wrap: wrap; justify-content: space-around; align-items: flex-start; text-align: center; gap: 1rem;">
     <div style="min-width: 150px; flex: 1 1 150px;">
      <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${formatProbabilityPercent(probAdMostSeats)}</p>
      <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">${strings.heroAdMostSeatsProb}<br><span style="font-size: 0.8em;">${strings.heroAdMostSeatsCondition}</span></p>
    </div>
     <div style="min-width: 150px; flex: 1 1 150px;">
      <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${formatProbabilityPercent(probPsMostSeats)}</p>
      <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">${strings.heroPsMostSeatsProb}<br><span style="font-size: 0.8em;">${strings.heroPsMostSeatsCondition}</span></p>
    </div>
     <div style="min-width: 150px; flex: 1 1 150px;">
      <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${formatProbabilityPercent(probChMostSeats)}</p>
      <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">${strings.heroChMostSeatsProb} <span class="text-xs">${strings.heroChMostSeatsCondition}</span></p>
    </div>
  </div>
</div>

```js
// Standard components
import { districtMap } from "./components/district-map.js";
import { nationalTrendsChart } from "./components/national-trends-chart.js";
// Placeholder components
import { seatProjection } from "./components/seat-projection.js";
import { coalitionDotPlot } from "./components/coalition-dot-plot.js";
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
// Import the standard html tag function
import {html} from "npm:htl"; 
// Import the NEW probability calculation functions
import { calculateBlocMajorityProbability, calculatePartyMostSeatsProbability, formatProbabilityPercent } from "./components/probability-calculator.js";

// Data loaders
const portugalTopoJson = await FileAttachment("data/Portugal-Distritos-Ilhas_TopoJSON.json").json();
const allNationalTrends = await FileAttachment("data/national_trends.json").json({typed: true});
const districtForecastData = await FileAttachment("./data/district_forecast.json").json({typed: true});

// Filter national trends data from March 10, 2024 onwards
const startDate = new Date("2024-03-10");
const nationalTrends = allNationalTrends.filter(d => new Date(d.date) >= startDate);
console.log(`[index.md] Filtered national trends. Original count: ${allNationalTrends.length}, New count: ${nationalTrends.length}`);

// REMOVE OLD contested data loader
// ADD NEW contested data loader
const contestedSummaryData = await FileAttachment("data/contested_summary.json").json(); 
// const seatProjectionData = await FileAttachment("data/sample_seat_forecast.json").json(); // CHANGE FROM SAMPLE
const wideSeatProjectionData = await FileAttachment("data/seat_forecast_simulations.json").json(); // USE REAL SIMULATIONS
// REMOVE OLD poll error data (or keep if used elsewhere, but not by heatmap)
// const pollErrorData = await FileAttachment("data/sample_poll_errors.json").json(); 
// Load NEW house effects data
const houseEffectsData = await FileAttachment("data/house_effects.json").json();
// Load NEW forecast comparison data
const forecastComparisonData = await FileAttachment("data/forecast_comparison_with_previous.json").json();

// --- Calculate Hero Banner Probs ---
import * as d3 from "npm:d3"; // Need d3 for calculations
// Import bloc definitions from NEW config file
import { leftBlocParties, rightBlocParties, majorityThreshold } from "./config/blocs.js";
// const leftBlocParties = ["PS", "BE", "CDU", "L"]; // REMOVE local definition 
// const rightBlocParties = ["AD", "IL"]; // REMOVE local definition
// const majorityThreshold = 116; // REMOVE local definition

// USE imported functions
const probLeftMajority = calculateBlocMajorityProbability(wideSeatProjectionData, leftBlocParties, majorityThreshold);
const probRightMajority = calculateBlocMajorityProbability(wideSeatProjectionData, rightBlocParties, majorityThreshold);

// USE imported function for party most seats probabilities
const probAdMostSeats = calculatePartyMostSeatsProbability(wideSeatProjectionData, 'AD', ['PS', 'CH']);
const probPsMostSeats = calculatePartyMostSeatsProbability(wideSeatProjectionData, 'PS', ['AD', 'CH']);
const probChMostSeats = calculatePartyMostSeatsProbability(wideSeatProjectionData, 'CH', ['AD', 'PS']);

// --- Get Latest National Trends for Sidebar Default ---
// Sort trends by date descending, filter for the mean metric, and transform the structure
const latestTrends = nationalTrends
  .filter(d => d.metric === "vote_share_mean") // Keep only the mean values
  .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
  .filter((d, i, arr) => arr.findIndex(t => t.party === d.party) === i) // Get the first (latest) entry for each party
  .map(d => ({ party: d.party, vote_share_mean: d.value * 100 })); // Transform to {party, vote_share_mean} AND SCALE

console.log("[index.md] Calculated latestTrends:", JSON.stringify(latestTrends)); // ADD LOG

// REMOVE State for Methodology visibility
// let methodologyVisible = false;

// Helper function to treat a string as raw HTML for HTL
function makeRaw(htmlString) {
  if (typeof document !== "undefined") {
    return document.createRange().createContextualFragment(htmlString);
  }
  return htmlString; // Fallback for non-browser environments (though unlikely here)
}

// Placeholder for methodology content (replace with actual markdown/html if available)
const methodologyContent = html`
    <div class="card p-4"> 
        <h2>${makeRaw(strings.methodologyTitle)}</h2>
        <p>${makeRaw(strings.methodologyP1)}</p>
        
        <h4>${makeRaw(strings.methodologyH4_1)}</h4>
        <p>${makeRaw(strings.methodologyP2)}</p>
        <p>${makeRaw(strings.methodologyP3)}</p>
        <ol>
            <li>${makeRaw(strings.methodologyLi1_1)}</li>
            <li>${makeRaw(strings.methodologyLi1_2)}</li>
            <li>${makeRaw(strings.methodologyLi1_3)}</li>
            <li>${makeRaw(strings.methodologyLi1_4)}</li>
        </ol>
        <p>${makeRaw(strings.methodologyP4)}</p>

        <h4>${makeRaw(strings.methodologyH4_2)}</h4>
        <p>${makeRaw(strings.methodologyP5)}</p>
        <ol>
            <li>${makeRaw(strings.methodologyLi2_1)}</li>
            <li>${makeRaw(strings.methodologyLi2_2)}</li>
            <li>${makeRaw(strings.methodologyLi2_3)}</li>
            <li>${makeRaw(strings.methodologyLi2_4)}</li>
            <li>${makeRaw(strings.methodologyLi2_5)}</li>
        </ol>
        <p>${makeRaw(strings.methodologyP6)}</p>
        <p>${makeRaw(strings.methodologyP7)}</p>

        <h4>${makeRaw(strings.methodologyH4_3)}</h4>
        <p>${makeRaw(strings.methodologyP8)}</p>
        <ul>
            <li>${makeRaw(strings.methodologyLi3_1)}</li>
            <li>${makeRaw(strings.methodologyLi3_2)}</li>
            <li>${makeRaw(strings.methodologyLi3_3)}</li>
            <li>${makeRaw(strings.methodologyLi3_4)}</li>
            <li>${makeRaw(strings.methodologyLi3_5)}</li>
        </ul>
        <p>${makeRaw(strings.methodologyP9)}</p>

        <h4>${makeRaw(strings.methodologyH4_4)}</h4>
        <h5>${makeRaw(strings.methodologyH5_1)}</h5>
        <p>${makeRaw(strings.methodologyP10)}</p>
        <h5>${makeRaw(strings.methodologyH5_2)}</h5>
        <p>${makeRaw(strings.methodologyP11)}</p>
        <h5>${makeRaw(strings.methodologyH5_3)}</h5>
        <p>${makeRaw(strings.methodologyP12)}</p>
        <p>${makeRaw(strings.methodologyP13)}</p>
        <h5>${makeRaw(strings.methodologyH5_4)}</h5>
        <p>${makeRaw(strings.methodologyP14)}</p>
        <h5>${makeRaw(strings.methodologyH5_5)}</h5>
        <p>${makeRaw(strings.methodologyP15)}</p>
        <p>${makeRaw(strings.methodologyP16)}</p>
        <h5>${makeRaw(strings.methodologyH5_6)}</h5>
        <p>${makeRaw(strings.methodologyP17)}</p>
        <p>${makeRaw(strings.methodologyP18)}</p>
        <p>${makeRaw(strings.methodologyP19)}</p>

        <h4>${makeRaw(strings.methodologyH4_5)}</h4>
        <h5>${makeRaw(strings.methodologyH5_7)}</h5>
        <p>${makeRaw(strings.methodologyP20)}</p>
        <h5>${makeRaw(strings.methodologyH5_8)}</h5>
        <p>${makeRaw(strings.methodologyP21)}</p>
        <h5>${makeRaw(strings.methodologyH5_9)}</h5>
        <p>${makeRaw(strings.methodologyP22)}</p>
        <h5>${makeRaw(strings.methodologyH5_10)}</h5>
        <p>${makeRaw(strings.methodologyP23)}</p>
        <ul><li>${makeRaw(strings.methodologyLi4_1)}</li>
        <li>${makeRaw(strings.methodologyLi4_2)}</li></ul>
        <h5>${makeRaw(strings.methodologyH5_11)}</h5>
        <p>${makeRaw(strings.methodologyP24)}</p>
        
        <h4>${makeRaw(strings.methodologyH4_6)}</h4>
        <p>${makeRaw(strings.methodologyP25)}</p>
        <ol>
            <li>${makeRaw(strings.methodologyLi5_1)}</li>
            <li>${makeRaw(strings.methodologyLi5_2)}</li>
            <li>${makeRaw(strings.methodologyLi5_3)}</li>
            <li>${makeRaw(strings.methodologyLi5_4)}</li>
            <li>${makeRaw(strings.methodologyLi5_5)}</li>
        </ol>
        <p>${makeRaw(strings.methodologyP26)}</p>
        <h5>${makeRaw(strings.methodologyH5_12)}</h5>
        <p>${makeRaw(strings.methodologyP27)}</p>
        <p>${makeRaw(strings.methodologyP28)}</p>
        <ol>
            <li>${makeRaw(strings.methodologyLi6_1)}</li>
            <li>${makeRaw(strings.methodologyLi6_2)}</li>
        </ol>
        <p>${makeRaw(strings.methodologyP29)}</p>
        <h5>${makeRaw(strings.methodologyH5_13)}</h5>
        <p>${makeRaw(strings.methodologyP30)}</p>
        
        <h4>${makeRaw(strings.methodologyH4_7)}</h4>
        <p>${makeRaw(strings.methodologyP31)}</p>
        <ol>
            <li>${makeRaw(strings.methodologyLi7_1)}</li>
            <li>${makeRaw(strings.methodologyLi7_2)}</li>
            <li>${makeRaw(strings.methodologyLi7_3)}</li>
        </ol>
        <p>${makeRaw(strings.methodologyP32)}</p>
        
        <p>${makeRaw(strings.methodologyP33_sources)}</p>
        <ul>
            <li>${makeRaw(strings.methodologyLi8_1)}</li>
            <li>${makeRaw(strings.methodologyLi8_2)}</li>
            <li>${makeRaw(strings.methodologyLi8_3)}</li>
        </ul>
    </div>
`;

// --- Transform Seat Projection Data from Wide to Long --- 
const seatProjectionData = wideSeatProjectionData.flatMap((drawObject, drawIndex) => 
    Object.entries(drawObject).map(([party, seats]) => ({
        draw: drawIndex, // Add a draw identifier if needed later, though not strictly used by current component
        party: party,
        seats: seats
    }))
);
console.log("[index.md] Transformed seatProjectionData (first 10 entries):", JSON.stringify(seatProjectionData.slice(0, 10)));

// Prepare map data
const mappedForecastData = districtForecastData.map(d => ({...d, district_id: d.NAME_1}));

// Function to extract date from run path
function extractDateFromPath(path) {
  if (!path) return "N/A";
  const match = path.match(/(\d{4})(\d{2})(\d{2})_\d{6}$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  // Fallback for different date_time string in path
  const pathMatch = path.match(/(\d{8})/);
  if (pathMatch && pathMatch[1]) {
    const dateStr = pathMatch[1];
    return `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
  }
  return "N/A";
}

// Function to render the forecast comparison table
function renderForecastComparisonTable(data) {
  if (!data || !data.metadata || !data.vote_share_comparison || !data.seat_comparison) {
    return html`<p class="note">${strings.forecastCompUnavailable}</p>`;
  }

  const runADateStr = extractDateFromPath(data.metadata.run_A_path);
  const runBDateStr = extractDateFromPath(data.metadata.run_B_path);

  const dateFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const currentLocale = currentLang === 'pt' ? 'pt-PT' : 'en-US';

  const runADate = runADateStr !== "N/A" ? new Date(runADateStr).toLocaleDateString(currentLocale, dateFormatOptions) : strings.forecastCompDateUnavailable;
  const runBDate = runBDateStr !== "N/A" ? new Date(runBDateStr).toLocaleDateString(currentLocale, dateFormatOptions) : strings.forecastCompDateUnavailable;
  const comparisonDate = new Date(data.metadata.comparison_timestamp).toLocaleDateString(currentLocale, {...dateFormatOptions, hour: '2-digit', minute: '2-digit'});

  // Helper to extract party from complex key like "latent_popularity_national[AD]"
  function getPartyFromKey(key) {
    const match = key.match(/\[(.*?)\]$/);
    return match ? match[1] : key; // Fallback to key if no match (shouldn't happen for vote_share)
  }

  // Determine the order of parties based on a typical display order or from the data itself.
  // Using a predefined order for consistency.
  const partyOrder = ["PS", "AD", "CH", "IL", "BE", "CDU", "L", "PAN", "OTH"];


  let tableHtml = `
    <div class="forecast-comparison-content">
      <p class="text-sm text-muted">${strings.forecastCompSubtitle1Part1}${runADate}${strings.forecastCompSubtitle1Part2}${runBDate}${strings.forecastCompSubtitle1Part3}</p>
      <p class="text-sm text-muted">${strings.forecastCompSubtitle2Part1}${comparisonDate}${strings.forecastCompSubtitle2Part2}</p>

      <h5>${strings.forecastCompH3_Vote}</h5>
      <table class="table table-sm table-striped">
        <thead>
          <tr>
            <th>${strings.forecastCompThParty}</th>
            <th>${strings.forecastCompThCurrent}</th>
            <th>${strings.forecastCompThPrevious}</th>
            <th>${strings.forecastCompThChange}</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Vote Share Table
  const voteShareEntries = Object.entries(data.vote_share_comparison);
  // Create a map for quick lookup
  const voteShareMap = new Map(voteShareEntries.map(([key, value]) => [getPartyFromKey(key), value]));

  // Convert map to array and sort for Vote Share
  const sortedVoteShare = Array.from(voteShareMap.entries())
    .map(([party, stats]) => ({ party, ...stats }))
    .sort((a, b) => b.run_A.mean_value - a.run_A.mean_value);

  for (const item of sortedVoteShare) {
    const party = item.party;
    const stats = item; // item already contains run_A and run_B
    const currentVote = (stats.run_A.mean_value * 100).toFixed(1);
    const previousVote = (stats.run_B.mean_value * 100).toFixed(1);
    const changeVote = ((stats.run_A.mean_value - stats.run_B.mean_value) * 100);
    const voteChangeClass = Math.abs(changeVote) < 0.0001 ? 'change-neutral' : (changeVote >= 0 ? 'change-positive' : 'change-negative');

    tableHtml += `
      <tr>
        <td>${party}</td>
        <td>${currentVote}%</td>
        <td>${previousVote}%</td>
        <td><span class="${voteChangeClass}">${changeVote >= 0 && Math.abs(changeVote) >= 0.0001 ? '+' : ''}${changeVote.toFixed(1)}%</span></td>
      </tr>
    `;
  }

  tableHtml += `
        </tbody>
      </table>

      <h5>${strings.forecastCompH3_Seats}</h5>
      <table class="table table-sm table-striped">
        <thead>
          <tr>
            <th>${strings.forecastCompThParty}</th>
            <th>${strings.forecastCompThCurrent}</th>
            <th>${strings.forecastCompThPrevious}</th>
            <th>${strings.forecastCompThChange}</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Seat Comparison Table
  const seatEntries = Object.entries(data.seat_comparison);
  // Create a map for quick lookup
  const seatMap = new Map(seatEntries); // Party is already the key

  // Convert map to array and sort for Seat Comparison
  const sortedSeatComparison = Array.from(seatMap.entries())
    .map(([party, stats]) => ({ party, ...stats }))
    .sort((a, b) => b.run_A.mean_value - a.run_A.mean_value);

  for (const item of sortedSeatComparison) {
    const party = item.party;
    const stats = item; // item already contains run_A and run_B
    const currentSeats = stats.run_A.mean_value.toFixed(1);
    const previousSeats = stats.run_B.mean_value.toFixed(1);
    const changeSeats = (stats.run_A.mean_value - stats.run_B.mean_value);
    const seatChangeClass = Math.abs(changeSeats) < 0.0001 ? 'change-neutral' : (changeSeats >= 0 ? 'change-positive' : 'change-negative');

    tableHtml += `
      <tr>
        <td>${party}</td>
        <td>${currentSeats}</td>
        <td>${previousSeats}</td>
        <td><span class="${seatChangeClass}">${changeSeats >= 0 && Math.abs(changeSeats) >= 0.0001 ? '+' : ''}${changeSeats.toFixed(1)}</span></td>
      </tr>
    `;
  }

  tableHtml += `
        </tbody>
      </table>
    </div>
  `;
  // Create a div and set its innerHTML to the constructed string
  const container = document.createElement("div");
  container.innerHTML = tableHtml;
  return container.firstElementChild; // Return the actual content div
}

// --- Remove Reactive State for Sidebar --- 
// mutable hoveredDistrictData = null; 

// Remove event listener block if it exists
// ```js ... listeners ... ``` 
```

<!-- Row 1 Annotation -->
<p class="text-muted text-sm mb-2">${strings.annoRow1}</p>

<!-- Row 1: Seat Projection Histogram and NEW Coalition Dot Plot -->
<div class="grid grid-cols-2 gap-4">
  <div id="seat-histogram-container" class="card p-4">
    <h2>${strings.seatProjectionTitle}</h2>
    ${seatProjection(seatProjectionData, {strings})}
  </div>
  <div id="coalition-violin-container" class="card p-4" style="overflow: hidden;">
    <h2>${strings.coalitionTotalsTitle}</h2>
    ${resize((width) => coalitionDotPlot(seatProjectionData, {width, strings}))}
  </div>
</div>

<!-- Row 2 Annotation -->
<p class="text-muted text-sm mb-2">${strings.annoRow2}</p>

<!-- Row 2: Combined Map and Sidebar -->
<div class="card col-span-2 p-4">
    <h2>${strings.districtForecastTitle}</h2>
    ${mapWithSidebar(portugalTopoJson, mappedForecastData, latestTrends, strings)}
</div>
  
<!-- Row 3 Annotation -->
<p class="text-muted text-sm mb-2">${strings.annoRow3}</p>
  
<!-- Row 3: Contested Seats Section -->
<div class="card grid-colspan-2 p-4">
${contestedSeatsSection(contestedSummaryData, {strings})}
</div>

<!-- Row 4 Annotation -->
<p class="text-muted text-sm mb-2">${strings.annoRow4}</p>

<!-- Row 4: National Trends Chart and Pollster Diagnostics -->
<div class="grid grid-cols-2 gap-4">
  <div class="card p-4">
    <h2>${strings.nationalVoteIntentionTitle}</h2>
    <p class="small note">${strings.nationalVoteIntentionNote}</p>
    ${resize((width) => nationalTrendsChart(nationalTrends, {width, strings}))}
  </div>
  <div class="card p-4" style="display: flex; flex-direction: column; justify-content: flex-start;">
    <h2>${strings.pollsterHouseEffectsTitle}</h2> 
    <div> 
      ${resize(width => houseEffectsHeatmap(houseEffectsData, { width, strings }))}
    </div>
  </div>
</div>

<!-- Insert the new forecast comparison section -->
<div class="card p-4">
    <h2>${strings.forecastCompTitle}</h2>
    ${renderForecastComparisonTable(forecastComparisonData)}
</div>

<!-- Methodology - Display directly -->
<div class="py-4">
${methodologyContent}
</div>

<!-- Updated Footer -->
<div class="small note py-4">
    ${strings.footerModelBy} ${strings.footerLastUpdated} <span data-source="currentDate"></span>.
    <br>
    ${strings.footerDataSources}
  </div>

<!-- Add global styles via a style tag -->
<style>
  /* Import Inter font */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

  /* Apply Inter font globally */
  body {
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* Optional: Adjust plot font if needed, though it often inherits */
  .plot {
      font-family: inherit;
  }

  .change-positive {
    color: var(--theme-foreground-positive, green);
  }

  .change-negative {
    color: var(--theme-foreground-negative, red);
  }

  .change-neutral {
    color: var(--theme-foreground-muted, gray);
  }
  
  /* REMOVED OG Mode CSS */
  /* body.og-mode ... */

</style>

```js
document.addEventListener("DOMContentLoaded", () => {
    const dateSpan = document.querySelector("span[data-source='currentDate']");
    if (dateSpan) {
        dateSpan.textContent = new Date().toLocaleDateString(currentLang === 'pt' ? 'pt-PT' : 'en-US');
    }
});
```
