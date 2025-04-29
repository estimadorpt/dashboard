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

// --- Helper to create the default legend HTML --- 
function createLegendHtml() {
    const legendData = partyOrder.map(party => ({
        color: partyColors[party] || "#888888",
        label: party
    }));
    return html`
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-bottom: 1rem;">
        ${legendData.map(item => html`
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <span style="width: 12px; height: 12px; background-color: ${item.color}; border-radius: 50%; display: inline-block;"></span>
            <span style="font-size: 0.85em;">${item.label}</span>
          </div>
        `)}
      </div>
      <p class="small note">Click on a district on the map for detailed forecast probabilities.</p>
    `; // Return DOM element directly
}

// --- Helper: Create Vertical Bar Chart Element ---
function createBarChartElement(forecastData, width) { 
    console.log("[createBarChartElement] Received forecastData:", JSON.stringify(forecastData)); // Log raw input
    
    // Process probabilities: Keep as 0-100 
    const topProbs = forecastData
        .map(d => ({ 
            party: d.party, 
            prob: (d.prob ?? d.vote_share_mean ?? 0) // Keep 0-100
        })) 
        .sort((a, b) => b.prob - a.prob) 
        .slice(0, 8); 
    
    const partyOrderMap = new Map(partyOrder.map((p, i) => [p, i]));
    const sortedData = topProbs.sort((a, b) => (partyOrderMap.get(a.party) ?? Infinity) - (partyOrderMap.get(b.party) ?? Infinity));

    console.log("[createBarChartElement] Processed sortedData for plot:", JSON.stringify(sortedData)); // Log data going into plot

    if (sortedData.length === 0) { 
        return html`<p class="small note">No forecast data available.</p>`;
    }

    try {
      const barChart = Plot.plot({
        // Use the passed width
        width: width, 
        marginTop: 5,
        marginLeft: 25, 
        marginRight: 10,
        marginBottom: 20, 
        height: 240, 
        y: { domain: partyOrder, axis: "left", label: null, padding: 0.2 },
        x: { 
            grid: true, 
            label: null, 
            domain: [0, 100], // Explicit 0-100 domain
            // nice: true // Optional: add nice ticks if needed
        },
        marks: [
            Plot.barX(sortedData, {
                y: "party",
                x: "prob",  // Use the 0-100 probability
                fill: (d) => partyColors[d.party] || '#888888', 
                // Title uses 0-100 data directly
                title: (d) => `${d.party}: ${d.prob.toFixed(1)}%` 
            }),
            Plot.ruleX([0]) 
        ]
      });
      return barChart;
    } catch (error) { 
         console.error("Error creating sidebar bar chart:", error);
         return html`<p class="small note error">Error displaying chart.</p>`;
    }
}

// --- Main Component ---
export function mapSidebar(clickedData, width) { 
  if (clickedData) {
    const { id, probs } = clickedData;
    const chartElement = createBarChartElement(probs, width); 
    return html`<div>
        <h4>${id}</h4> 
        <p style="font-size: 0.85em; margin-bottom: 0.1rem;">Vote Share Forecast:</p>
        ${chartElement}
    </div>`;
  } else {
    // Return empty or a placeholder when nothing is selected
    // return createLegendHtml(); // REMOVED Legend
    return html`<div class="small note" style="padding-top: 1rem; text-align: center;">Click a district on the map for details.</div>`; // Placeholder text
    // Or return new DocumentFragment(); for completely empty
  }
}