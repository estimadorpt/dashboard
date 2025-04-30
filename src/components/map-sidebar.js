import {html} from "npm:htl";
import { partyColors, partyOrder } from "../config/colors.js"; // Import shared config
// Import Plot for the bar chart
import * as Plot from "@observablehq/plot"; 

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
// Make this function handle data with either 'prob' or 'vote_share_mean'
function createBarChartElement(forecastData, width) { 
    console.log("[createBarChartElement] Received forecastData:", JSON.stringify(forecastData)); // Log raw input
    
    // Process probabilities/vote shares: Use prob OR vote_share_mean
    const processedData = forecastData
        .map(d => ({ 
            party: d.party, 
            value: (d.prob ?? d.vote_share_mean ?? 0) // Use 'prob' or 'vote_share_mean', fallback 0
        })) 
        .filter(d => d.value > 0) // Filter out zero values if needed, though sorting handles it mostly
        .sort((a, b) => b.value - a.value); // Sort by the value
    
    // --- Optional: Sort by partyOrder if preferred over sorting by value ---
    // const partyOrderMap = new Map(partyOrder.map((p, i) => [p, i]));
    // const sortedData = processedData.sort((a, b) => (partyOrderMap.get(a.party) ?? Infinity) - (partyOrderMap.get(b.party) ?? Infinity));
    // Use processedData directly if sorting by value is intended:
    const sortedData = processedData;
    
    console.log("[createBarChartElement] Processed sortedData for plot:", JSON.stringify(sortedData)); // Log data going into plot

    if (sortedData.length === 0) { 
        return html`<p class="small note">No forecast data available.</p>`;
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
        height: 240, 
        // Use parties from the actual data for the y-domain, sorted by value
        y: { domain: sortedData.map(d => d.party), axis: "left", label: null, padding: 0.2 },
        x: { grid: true, label: null, domain: [0, 100] }, // Assuming 0-100 range
        marks: [
            Plot.barX(sortedData, {
                y: "party",
                x: "value", // Use the unified 'value' field
                fill: (d) => partyColors[d.party] || '#888888', 
                title: (d) => `${d.party}: ${d.value.toFixed(1)}%` // Use the unified 'value'
            }),
            Plot.ruleX([0]),
            // Add text labels inside bars
            Plot.text(sortedData.filter(d => (d.value / 100 * plotAreaWidth) > pixelThreshold), { // Filter data based on calculated width
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
  if (clickedData) {
    const { id, probs } = clickedData;
    // Use the existing bar chart function for district data
    const chartElement = createBarChartElement(probs, width); 
    return html`<div>
        <h4>${id}</h4> 
        <p style="font-size: 0.85em; margin-bottom: 0.1rem;">Vote Share Forecast:</p>
        ${chartElement}
    </div>`;
  } else {
    // Show national bar chart by default using the SAME function
    const nationalChartElement = createBarChartElement(nationalTrendsData, width);
    return html`<div>
        <p style="font-size: 0.85em; margin-bottom: 0.1rem;">National Vote Intention (Latest):</p>
        ${nationalChartElement}
        <p class="small note" style="padding-top: 1rem; text-align: center;">Click a district on the map for details.</p>
    </div>`;
  }
}