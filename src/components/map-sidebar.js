import {html} from "npm:htl";
import { partyColors, partyOrder } from "../config/colors.js"; // Import shared config
// Import Plot for the bar chart
import * as Plot from "@observablehq/plot"; 
// Import resize helper
import { resize } from "npm:@observablehq/stdlib";

// Generate legend data dynamically from imported config
// Note: This assumes the legend should show all parties from partyOrder.
// Adjust if only a subset specific to the map is needed.
const legendData = partyOrder.map(party => ({
  color: partyColors[party] || "#888888", // Use color from config, fallback grey
  label: party
}));

/* Basic placeholder legend - removed
const legendData = [
  {color: "#e41a1c", label: "PS"},
  {color: "#ff7f00", label: "AD"}, // Assuming AD replaces PSD for now
  {color: "#4daf4a", label: "CH"},
  {color: "#984ea3", label: "IL"},
  {color: "#377eb8", label: "BE"},
  {color: "#a65628", label: "CDU"}, // Assuming CDU replaces PCP
  {color: "#f781bf", label: "L"},
  {color: "#999999", label: "PAN"}
];
*/

// --- Helper: Create Vertical Bar Chart Element (Handles District OR National Data) ---
function createBarChartElement(forecastData, width) { 
    // Log raw input for debugging
    console.log("[createBarChartElement] Received forecastData (direct):", forecastData); // Log directly
    console.log("[createBarChartElement] Received forecastData (keys):", forecastData ? Object.keys(forecastData) : 'null/undefined'); // Log keys
    console.log("[createBarChartElement] Received forecastData (stringified):", JSON.stringify(forecastData)); // Keep stringify for comparison

    // --- Data Transformation --- 
    let inputDataAsArray;
    
    // Check if forecastData is an array (national trends) or an object (district probs)
    if (Array.isArray(forecastData)) {
        // Already an array (national trends)
        inputDataAsArray = forecastData.map(d => ({
            party: d.party,
            value: d.vote_share_mean // National data is already 0-100
        }));
    } else if (typeof forecastData === 'object' && forecastData !== null) {
        // It's an object (district probs), convert to array AND scale to percentage
        console.log("[createBarChartElement] Processing district object. Keys:", Object.keys(forecastData)); // Log keys
        inputDataAsArray = Object.entries(forecastData).map(([party, prob]) => ({
            party: party,
            value: prob * 100 // Scale district prob (0-1) to percentage (0-100)
        }));
         console.log("[createBarChartElement] Object converted to array (scaled):", JSON.stringify(inputDataAsArray)); // Log result
    } else {
        // Invalid data format
        console.error("[createBarChartElement] Invalid forecastData format:", forecastData);
        inputDataAsArray = [];
    }
    
    // Now process the unified array format
    const processedData = inputDataAsArray
        // Filter out entries with undefined/null/NaN values or missing party
        .filter(d => d && d.party && d.value !== undefined && d.value !== null && !isNaN(d.value))
        // Sort data by VALUE descending
        .sort((a, b) => b.value - a.value); 

    console.log("[createBarChartElement] Processed sortedData for plot:", JSON.stringify(processedData));

    // Check if processed data is empty after filtering/transformation
    if (processedData.length === 0) {
        return html`<p class="small note">No valid forecast data available to display.</p>`;
    }

    const marginLeft = 40;
    const marginRight = 10;
    const plotAreaWidth = width - marginLeft - marginRight;
    const pixelThreshold = 12;

    try {
      const barChart = Plot.plot({
        width: width, 
        marginTop: 5,
        marginLeft: marginLeft, 
        marginRight: marginRight,
        marginBottom: 20, 
        // height: "auto", // REVERT: Remove height parameter again
        // Use parties from the actual data for the y-domain, now sorted by value
        y: { domain: processedData.map(d => d.party), axis: "left", label: null, padding: 0.1 },
        x: { grid: true, label: null, domain: [0, 50] }, // ADJUSTED domain to 0-50
        marks: [
            Plot.barX(processedData, {
                y: "party",
                x: "value", // Use the unified 'value' field
                fill: (d) => partyColors[d.party] || '#888888', 
                title: (d) => `${d.party}: ${d.value.toFixed(1)}%`, // Use the unified 'value'
                inset: 0.1 // ADD inset to reduce padding within the band
            }),
            Plot.ruleX([0]),
            // Add text labels inside bars
            Plot.text(processedData.filter(d => (d.value / 100 * plotAreaWidth) > pixelThreshold), { // Filter data based on calculated width
                x: "value", // Use unified 'value'
                y: "party",
                text: d => `${d.value.toFixed(0)}%`, // Display integer percentage
                dx: -4, // Offset text slightly left from the end of the bar
                textAnchor: "end", // Anchor text to its end (right edge)
                fill: "white", // White text
                fontSize: 10 // Small font size
            })
        ]
      });
      return barChart;
    } catch (error) { 
         console.error("Error creating sidebar bar chart:", error);
         return html`<p class="small note error">Error displaying chart.</p>`;
    }
}

// --- Main Component ---
// Accept nationalTrendsData as the third argument
export function mapSidebar(clickedData, width, nationalTrendsData) { 
  console.log("[mapSidebar] Received clickedData:", JSON.stringify(clickedData)); // Log received data
  if (clickedData) {
    const { id, probs } = clickedData;
    console.log("[mapSidebar] Destructured probs:", JSON.stringify(probs)); // Log after destructuring
    // Use resize to pass container width to the chart function
    const chartElement = resize((w) => createBarChartElement(probs, w)); 
    return html`<div>
        <h4>${id}</h4> 
        <p style="font-size: 0.85em; margin-bottom: 0.1rem;">Vote Share Forecast:</p>
        ${chartElement}
    </div>`;
  } else {
    // Show national bar chart by default using the SAME function, wrapped in resize
    const nationalChartElement = resize((w) => createBarChartElement(nationalTrendsData, w));
    return html`<div>
        <p style="font-size: 0.85em; margin-bottom: 0.1rem;">National Vote Intention (Latest):</p>
        ${nationalChartElement}
        <p class="small note" style="padding-top: 1rem; text-align: center;">Click a district on the map for details.</p>
    </div>`;
  }
}