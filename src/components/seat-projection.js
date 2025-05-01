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

  // --- Filter out 'OTH' --- 
  const filteredDrawData = drawData.filter(d => d.party !== 'OTH');
  // Filter partyOrder locally, keeping the original import for colors
  const filteredPartyOrder = partyOrder.filter(p => p !== 'OTH'); 

  // Calculate medians per party using FILTERED data
  const medians = Array.from(
    d3.rollup(filteredDrawData, v => d3.median(v, d => d.seats), d => d.party),
    ([party, medianSeats]) => ({party, medianSeats})
  );

  // --- Sort parties by median seats (descending) ---
  medians.sort((a, b) => b.medianSeats - a.medianSeats);
  const sortedPartyNames = medians.map(d => d.party);

  // Convert medians to a Map for easy lookup in tooltips (use filtered medians)
  const medianMap = new Map(medians.map(d => [d.party, d.medianSeats]));
  // console.log("[seatProjection] medianMap:", medianMap); // REMOVE Log

  // Use imported partyOrder for colors, but filtered order for domains
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
    height: 400,
    marginLeft: 40,
    marginRight: 20,
    x: { 
        domain: [0, 150], 
        label: "Seats won", 
        axis: "bottom",
        ticks: [0, 50, 100, 116, 150]
    },
    y: { axis: null }, // No explicit y-axis for count within facets
    // Define vertical facets by party using SORTED order
    fy: {
        domain: sortedPartyNames, // Use sorted names for facet domain
        axis: "left",
        label: null,
        marginBottom: 4,
        dy: 60
    },
    // Add color scale - Use SORTED order for domain and range mapping
    color: {
      domain: sortedPartyNames, // Use sorted names for color domain
      range: sortedPartyNames.map(p => partyColors[p] || "#888888"), // Map sorted names to colors
      legend: false // Optionally hide color legend if redundant with fy axis
    },
    // Histogram bars using rectY and binX, relying on fy for data filtering
    marks: [
      Plot.rectY(filteredDrawData, Plot.binX(
        { y: "count" }, // Calculate count within each bin for each facet
        {
          x: "seats",
          fy: "party", // Explicitly confirm faceting channel
          // Use the party field for the fill color
          fill: "party",
          fillOpacity: 0.7, // Slightly adjust opacity if needed
          thresholds: 30, // ~30 bins across 0-230
          inset: 0.5,
          tip: true // Rely on default tip behavior
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
      // Add text labels for medians
      Plot.text(medians, {
        x: "medianSeats",
        fy: "party",
        text: d => d.medianSeats.toFixed(0), // Display median value (no decimals)
        dy: -6, // Position slightly above the line
        fill: "black",
        fontSize: 10, // Smaller font size
        textAnchor: "middle"
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