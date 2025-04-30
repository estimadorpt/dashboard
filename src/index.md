---
title: Portuguese Election Forecast Model
theme: air
toc: false
---

# Portuguese Election Forecast
<p class="text-muted text-sm">Last model run: ${new Date().toUTCString()}</p>

<!-- UPDATED HERO PROBABILITIES SECTION -->
<div style="text-align: center; margin-bottom: 2rem; padding: 1rem 0; border-top: 1px solid var(--theme-foreground-faint); border-bottom: 1px solid var(--theme-foreground-faint);">
  <div style="display: inline-block; margin: 0 1.5rem;">
    <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${(probLeftMajority * 100).toFixed(0)}%</p>
    <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">Left Bloc Majority Probability<br><span style="font-size: 0.8em;">(PS+BE+CDU ≥ 116 seats)</span></p>
  </div>
  <div style="display: inline-block; margin: 0 1.5rem;">
    <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${(probRightMajority * 100).toFixed(0)}%</p>
    <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">Right Bloc Majority Probability<br><span style="font-size: 0.8em;">(AD+IL ≥ 116 seats)</span></p>
  </div>
  <div style="display: inline-block; margin: 0 1.5rem;">
    <p style="font-size: 2em; font-weight: 500; margin-bottom: 0.2rem; line-height: 1;">${((1 - probLeftMajority - probRightMajority) * 100).toFixed(0)}%</p>
    <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-top: 0;">No Bloc Majority<br><span style="font-size: 0.8em;">(Complex negotiations likely)</span></p>
  </div>
</div>

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
// Import the standard html tag function
import {html} from "npm:htl"; 

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

// --- Calculate Hero Banner Probs ---
import * as d3 from "npm:d3"; // Need d3 for calculations
// Import bloc definitions from NEW config file
import { leftBlocParties, rightBlocParties, majorityThreshold } from "./config/blocs.js";
// const leftBlocParties = ["PS", "BE", "CDU", "L"]; // REMOVE local definition 
// const rightBlocParties = ["AD", "IL"]; // REMOVE local definition
// const majorityThreshold = 116; // REMOVE local definition

function calculateBlocMajorityProbability(drawData, coalitionParties) {
  if (!drawData || drawData.length === 0) return 0;
  const seatsByDraw = d3.rollup(
    drawData,
    (v) => d3.sum(v, (d) => coalitionParties.includes(d.party) ? d.seats : 0),
    (d) => d.draw
  );
  const blocSeats = Array.from(seatsByDraw.values());
  const totalDraws = blocSeats.length;
  if (totalDraws === 0) return 0;
  const majorityDraws = blocSeats.filter(seats => seats >= majorityThreshold).length;
  return totalDraws > 0 ? (majorityDraws / totalDraws) : 0;
}

const probLeftMajority = calculateBlocMajorityProbability(wideSeatProjectionData, leftBlocParties);
const probRightMajority = calculateBlocMajorityProbability(wideSeatProjectionData, rightBlocParties);

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

// Placeholder for methodology content (replace with actual markdown/html if available)
const methodologyContent = html`
    <div class="card p-4"> 
        <h2>How Our Dynamic Gaussian Process Election Model Works</h2>
        <p>We've developed a statistical forecasting model for Portuguese elections that captures both long-term political trends and district-level dynamics. It represents an evolution of traditional election models, designed specifically to address the challenges of Portugal's multi-party, district-based electoral system. This document explains the approach, intuition, and technical details behind our methodology.</p>
        
        <h4>The Challenge of Forecasting Portuguese Elections</h4>
        <p>Portugal's electoral landscape presents unique forecasting challenges. The country has multiple significant political parties ranging from the traditional center-left (PS) and center-right (AD) to newer entrants like the liberal IL and right-wing Chega. Elections are decided through a proportional representation system across multiple districts, with seats allocated using the D'Hondt method.</p>
        <p>Traditional forecasting approaches struggle with several aspects of this system:</p>
        <ol>
            <li>District-level variation in political support that doesn't uniformly follow national trends</li>
            <li>Different parties having varying sensitivity to national sentiment shifts</li>
            <li>Campaign dynamics that can shift rapidly during election season</li>
            <li>Pollster-specific biases that need correction</li>
        </ol>
        <p>Our dynamic Gaussian process model addresses these challenges through a principled Bayesian statistical framework.</p>

        <h4>The Intuition Behind the Model</h4>
        <p>Our model works by breaking down party support into several components:</p>
        <ol>
            <li><strong>Long-term national trends</strong>: The baseline support for each party over extended periods</li>
            <li><strong>Short-term fluctuations</strong>: Changes in support during campaign periods</li>
            <li><strong>District-specific patterns</strong>: How each district deviates from national trends</li>
            <li><strong>Pollster effects</strong>: Systematic biases in how polling firms measure support</li>
            <li><strong>Uncertainty</strong>: The probabilistic range of possible outcomes</li>
        </ol>
        <p>The "dynamic" in our model name refers to its ability to capture changing support patterns over time, while "GP" (Gaussian Process) refers to the statistical technique that allows us to model smoothly varying support without imposing rigid assumptions about how it changes.</p>
        <p>Unlike simpler approaches that rely on uniform national swing (where all districts are assumed to shift by the same amount), our model allows for differential shifts. When national support for party A increases by 5 percentage points, some districts might shift by 8 points, while others barely move. The model learns these patterns from historical data.</p>

        <h4>How the Model Functions</h4>
        <p>Imagine a party's support level as an invisible line that evolves continuously over time. We never observe this line directly—we only see noisy snapshots from polls or election results. Our model reconstructs the most likely trajectory of this line by combining:</p>
        <ul>
            <li>Prior knowledge about typical political changes</li>
            <li>Information from polls</li>
            <li>Historical election results</li>
            <li>District-specific patterns</li>
            <li>Knowledge about how pollsters tend to measure</li>
        </ul>
        <p>When the model forecasts an upcoming election, it projects these components forward in time and aggregates them into probabilistic vote shares for each party in each district. These are then translated into seat allocations using the D'Hondt method.</p>

        <h4>Technical Components of the Model</h4>
        <h5>1. Baseline GP over Calendar Time</h5>
        <p>The foundation of the model is a smooth, long-term trend representing the baseline national support for each party. This is modeled as a Gaussian Process evolving over calendar time. The properties of this GP (specifically its covariance structure) are chosen to reflect assumptions about the slow, gradual nature of fundamental political shifts, capturing dependencies over multiple years.</p>
        <h5>2. Medium-Term GP over Calendar Time</h5>
        <p>Superimposed on the baseline trend is a second Gaussian Process, also evolving over calendar time. This component is designed with a moderate correlation length (e.g., centered around a year), allowing it to capture deviations from the long-term baseline over medium timescales. This could reflect evolving responses to specific events or other medium-term dynamics.</p>
        <h5>3. Very Short-Term GP over Calendar Time</h5>
        <p>A third Gaussian Process, again over calendar time, is added to capture even more rapid fluctuations. This GP has a very short correlation length (e.g., centered around a few weeks). It is designed to model fast-moving campaign dynamics, late shifts in public opinion, or reactions to breaking news closer to an election.</p>
        <p>The sum of these three processes (baseline, medium-term, very short-term) forms the latent (unobserved) national support trajectory for each party.</p>
        <h5>4. District-Level Effects</h5>
        <p>To account for Portugal's district-based system, the model incorporates district-specific deviations from the national trend. In the current implementation, this is achieved solely through estimated <strong>static base offset</strong> parameters for each district and party. These parameters represent the persistent, time-invariant tendency for a district's support for a given party to be higher or lower than the national average, relative to the average trend. These offsets are learned primarily from historical election results at the district level. Unlike previous experimental versions, this model <em>currently uses only these static offsets</em>. It assumes that district deviations from the national trend do not dynamically change based on the magnitude of national swings within a single election cycle (i.e., the sensitivity or 'beta' component is not currently active).</p>
        <h5>5. House Effects (Pollster Biases) and Poll Bias</h5>
        <p>The model explicitly accounts for systematic variations between polling firms. These "house effects" are modeled as parameters specific to each pollster and party, constrained such that they represent relative deviations (i.e., summing to zero across parties for a given pollster). This captures the tendency of some pollsters to relatively overestimate or underestimate certain parties.</p>
        <p>Additionally, an overall poll bias term, also constrained to sum to zero across parties, is included. This captures any average systematic deviation of poll results from the underlying national trend, distinct from individual pollster effects.</p>
        <h5>6. Latent Score, Transformation, and Likelihood</h5>
        <p>The national trend components (sum of the three calendar-time GPs) are combined with the relevant bias terms (house effects and poll bias for poll observations, or the static district base offsets for district predictions) to produce a latent score representing underlying support.</p>
        <p>A softmax transformation converts these unbounded latent scores into a set of probabilities (vote shares) for each party that necessarily sum to one.</p>
        <p>Finally, the observed data—vote counts from polls, district-level election results, <strong>and national-level election results</strong>—are linked to these modeled probabilities through a statistical likelihood function. The chosen likelihood (typically a Dirichlet-Multinomial distribution) is suitable for count data representing proportions and includes parameters to accommodate potential overdispersion (more variability than predicted by simpler models). The inclusion of both district and national results helps anchor the national trend prediction and inform the district offsets.</p>

        <h4>Statistical Methodology</h4>
        <h5>Gaussian Processes</h5>
        <p>Gaussian Processes provide a flexible, non-parametric Bayesian approach to function estimation. Here, they are used to model the unobserved national support trends over time without imposing rigid functional forms. The choice of covariance kernel and its parameters (lengthscale, amplitude) encode prior beliefs about the smoothness and variability of these trends.</p>
        <h5>Hierarchical Modeling</h5>
        <p>The model employs a hierarchical structure, particularly for house effects and district offsets. Parameters for individual pollsters or districts are assumed to be drawn from common distributions, allowing the model to borrow strength across units and make more robust estimates, especially for units with less data.</p>
        <h5>Bayesian Inference</h5>
        <p>The model parameters are estimated within a Bayesian framework, typically using Markov Chain Monte Carlo (MCMC) methods. This yields a full posterior distribution for all parameters and derived quantities (like vote shares and seat predictions), naturally quantifying uncertainty.</p>
        <h5>Computational Techniques</h5>
        <p>To make Bayesian inference computationally feasible, the model utilizes:</p>
        <ul><li><strong>GP Approximations:</strong> Efficient methods (like basis function expansions) are used to approximate the full Gaussian Processes, reducing the computational complexity.</li>
        <li><strong>Reparameterization:</strong> Techniques like non-centered parameterization are used for certain hierarchical parameters to improve the geometry of the posterior distribution and the efficiency of MCMC sampling algorithms.</li></ul>
        <h5>Overdispersion Modeling</h5>
        <p>The use of a likelihood function that explicitly models overdispersion (like the Dirichlet-Multinomial) is crucial for realistically capturing the noise characteristics of polling and election data.</p>
        
        <h4>Making Predictions</h4>
        <p>Generating forecasts involves several steps:</p>
        <ol>
            <li>Draw samples from the joint posterior distribution of all model parameters obtained via Bayesian inference.</li>
            <li>For each sample, compute the latent national support trend (sum of the three calendar-time GPs) at the desired future date(s).</li>
            <li>Apply the relevant district-specific <strong>static base offset</strong> parameters (as estimated from the posterior) to the national latent trend to get district-level latent scores.</li>
            <li>Convert these latent scores into predicted vote share probabilities using the softmax transformation.</li>
            <li>Simulate the seat allocation process (D'Hondt method) using these predicted vote shares for each posterior sample.</li>
        </ol>
        <p>Aggregating the results across all posterior samples provides a probabilistic forecast for vote shares and seat counts, inherently reflecting model uncertainty.</p>
        <h5>District Vote Share Prediction</h5>
        <p>District-level vote share predictions are derived by combining the posterior distribution of the national latent trend (sum of the three calendar-time GPs) with the posterior distribution of the <strong>static</strong> district base offsets.</p>
        <p>Specifically, for each posterior sample and each district:</p>
        <ol>
            <li>The estimated <strong>static base offset</strong> for that district and party is added to the national latent trend value (sum of the three GPs) for that party at the target date.</li>
            <li>The resulting adjusted latent scores are transformed into probabilities (vote shares summing to 1) via the softmax function.</li>
        </ol>
        <p>This procedure yields a full posterior distribution of predicted vote shares for each party within each district.</p>
        <h5>Seat Allocation</h5>
        <p>Once we have vote share predictions, we simulate the election outcome using the D'Hondt method, which allocates seats proportionally based on each party's votes. By running this simulation thousands of times across our posterior samples, we generate a probability distribution over possible seat outcomes for each party.</p>
        
        <h4>Limitations and Future Improvements</h4>
        <p>Like all models, ours has limitations based on its current structure:</p>
        <ol>
            <li>It assumes that historical patterns of <em>static</em> district behavior (relative to the nation, captured by the base offsets) will continue into the future. The model currently does not account for potential dynamic changes in how districts respond to national swings within a cycle.</li>
            <li>It does not incorporate non-polling data such as economic indicators or government approval ratings.</li>
            <li>The district effects model could potentially be enhanced in future versions by re-introducing dynamic components (like sensitivity/beta), adding district-level covariates, or incorporating spatial correlation structures.</li>
        </ol>
        <p>Future versions may address these limitations by incorporating additional data sources (like economic indicators), activating dynamic district effects, using district-level covariates (such as demographics or past voting patterns) to better model the static offsets, or implementing spatial modeling techniques to capture correlations between neighboring districts.</p>
        
        <p><strong>Sources:</strong></p>
        <ul>
            <li>Polling data aggregate from major national pollsters (Aximage, CESOP, Eurosondagem, Intercampus).</li>
            <li>Historical election results from CNE (Comissão Nacional de Eleições).</li>
            <li>Demographic data from INE (Instituto Nacional de Estatística).</li>
        </ul>
        <p><em>Code available at [Link to Repo]</em></p>
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

// --- Remove Reactive State for Sidebar --- 
// mutable hoveredDistrictData = null; 

// Remove event listener block if it exists
// ```js ... listeners ... ``` 
```

<!-- Row 1 Annotation -->
<p class="text-muted text-sm mb-2">Seat projections show likely outcomes for each party with 116 seats needed for a majority (red line). Left chart shows distribution by party; right chart shows probability of coalition blocs reaching majority threshold.</p>

<!-- Row 1: Seat Projection Histogram and Coalition Gauge -->
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

<!-- Row 2 Annotation -->
<p class="text-muted text-sm mb-2">District map colored by predicted leading party in each region. Click any district to see detailed vote share forecasts, or view national trends in the right panel when no district is selected.</p>

<!-- Row 2: Combined Map and Sidebar -->
<div class="card col-span-2 p-4">
    <h2>District Forecast & Details</h2>
    ${mapWithSidebar(portugalTopoJson, mappedForecastData, latestTrends)}
</div>
  
<!-- Row 3 Annotation -->
<p class="text-muted text-sm mb-2">Most contested seats across Portugal where small shifts could change outcomes. The table shows seats closest to flipping, with probability breakdown bars showing which parties might win each seat. Click any row for detailed analysis.</p>
  
<!-- Row 3: Contested Seats Section -->
<div class="card grid-colspan-2 p-4">
${contestedSeatsSection(contestedSummaryData)}
</div>

<!-- Row 4 Annotation -->
<p class="text-muted text-sm mb-2">Left: National voting intention trends with 95% credible intervals, combining polling data since 2024. Right: Estimated polling house effects showing systematic biases — red indicates pollsters overestimating parties, blue shows underestimation.</p>

<!-- Row 4: National Trends Chart and Pollster Diagnostics -->
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

<!-- Methodology - Display directly -->
<div class="py-4">
${methodologyContent}
</div>

<!-- Updated Footer -->
<div class="small note py-4">
    Model and visualizations by [Your Organization]. Last updated: ${new Date().toLocaleDateString()}.
    <br>Data sources: Polling aggregation from national pollsters (Aximage, CESOP, Eurosondagem, Intercampus), historical election results from CNE, and demographic data from INE.
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
  
  /* REMOVE Button styles if no longer needed - kept for now in case other buttons exist */
  /*
  .button {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      background-color: #eee;
      font-size: 0.9em;
      margin-bottom: 1rem; 
  }
  .button-secondary {
      background-color: #f8f9fa;
      border-color: #adb5bd;
  }
  .button:hover {
      background-color: #ddd;
  }
  */
</style>
