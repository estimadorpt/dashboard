import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { partyColors, partyOrder } from "../config/colors.js"; // Import shared config

export function seatProjection(drawData, options) {
  if (!drawData || drawData.length === 0) {
    const placeholderDiv = document.createElement("div");
    placeholderDiv.textContent = "Seat projection data loading...";
    Object.assign(placeholderDiv.style, {
      display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px"
    });
    return placeholderDiv;
  }

  // Calculate medians per party
  const medians = Array.from(
    d3.rollup(drawData, v => d3.median(v, d => d.seats), d => d.party),
    ([party, medianSeats]) => ({party, medianSeats})
  );

  // Use imported partyOrder
  // const partyOrder = ["AD", "PS", "CH", "IL", "BE", "CDU", "OTH"]; - Removed
  // Use imported partyColors
  /* // Define party colors (example colors, adjust as needed) - Removed
  const partyColors = {
    "AD": "#FF8C00",  // Dark Orange
    "PS": "#E41A1C",  // Red
    "CH": "#377EB8",  // Blue
    "IL": "#FFFF33",  // Yellow (adjust for visibility)
    "BE": "#984EA3",  // Purple
    "CDU": "#4DAF4A", // Green
    "OTH": "#A65628"  // Brown
  };
  */

  // --- Rebuilding Plot: Step 2 - Colors Added ---
  const plot = Plot.plot({
    height: 300,
    marginLeft: 40,
    marginRight: 20,
    x: { 
        domain: [0, 150], 
        label: "Seats won ➜", 
        axis: "bottom",
        ticks: [0, 50, 100, 116, 150]
    },
    y: { axis: null }, // No explicit y-axis for count within facets
    // Define vertical facets by party
    fy: {
        domain: partyOrder,
        axis: "left",
        label: null,
        marginBottom: 4
    },
    // Add color scale
    color: {
      domain: partyOrder,
      range: partyOrder.map(p => partyColors[p] || "#888888"), // Map names to colors, fallback grey
      legend: false // Optionally hide color legend if redundant with fy axis
    },
    // Histogram bars using rectY and binX, relying on fy for data filtering
    marks: [
      Plot.rectY(drawData, Plot.binX(
        { y: "count" }, // Calculate count within each bin for each facet
        {
          x: "seats",
          fy: "party", // Explicitly confirm faceting channel
          // Use the party field for the fill color
          fill: "party",
          fillOpacity: 0.7, // Slightly adjust opacity if needed
          thresholds: 30, // ~30 bins across 0-230
          inset: 0.5,
          tip: true,
          title: bin => `${bin.fy}\nSeats: ${bin.x0}-${bin.x1}\nDraws: ${bin.length}` // Add party to tooltip
        }
      )),
      Plot.ruleY([0]), // Baseline for each histogram
      // Median lines - Explicitly link rule's data to facet via fy channel
      Plot.ruleX(medians, {
        x: "medianSeats",
        fy: "party", // <-- Explicitly link the rule's data via the fy channel
        stroke: "black",
        strokeWidth: 1.5,
        strokeDasharray: "2,2" // Dashed line for median
      }),
      // Majority line (drawn once across all facets)
      Plot.ruleX([116], {
        stroke: "red",
        strokeWidth: 1.5,
        strokeDasharray: "4,2", // Different dash pattern
        facet: "exclude" // Ensure line spans across all facets
      })
    ],
    ...options
  });

  return plot;
} 