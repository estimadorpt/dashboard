import * as Plot from "@observablehq/plot";
import * as d3 from "npm:d3";
import { partyOrder, partyColors } from "../config/colors.js"; // Use shared party order and colors
import {html} from "npm:htl";

export function houseEffectsHeatmap(houseEffectsData, { width } = {}) {
  if (!houseEffectsData || houseEffectsData.length === 0) {
    return html`<div class="small note" style="padding: 1rem; text-align: center;">House effects data not available.</div>`;
  }

  // --- Filter out 'OTH' --- 
  const filteredHouseEffectsData = houseEffectsData.filter(d => d.party !== 'OTH');
  // Filter partyOrder locally for the x-axis
  const filteredPartyOrder = partyOrder.filter(p => p !== 'OTH');

  // --- Data processing --- // USE FILTERED DATA
  const pollsters = [...new Set(filteredHouseEffectsData.map(d => d.pollster))].sort(); // Alphabetical pollsters
  // const parties = partyOrder; // Use defined party order - OLD
  const parties = filteredPartyOrder; // Use filtered order for x-axis

  // Calculate max absolute effect for symmetric color scale - USE FILTERED DATA
  const maxAbs = d3.max(filteredHouseEffectsData, d => Math.abs(d.house_effect)); 
  // console.log("[houseEffectsHeatmap] Calculated maxAbs:", maxAbs); // REMOVE Log
  // Log actual min/max for comparison - USE FILTERED DATA
  const [minEffect, maxEffect] = d3.extent(filteredHouseEffectsData, d => d.house_effect);
  // console.log(`[houseEffectsHeatmap] Actual min/max effect: ${minEffect} / ${maxEffect}`); // REMOVE Log

  if (!maxAbs) {
     console.warn("[houseEffectsHeatmap] Max absolute effect is 0 or undefined. Check data.");
     return html`<div class="small note" style="padding: 1rem; text-align: center;">House effects data shows no variation.</div>`;
  }

  // --- Dimensions & Constants ---
  const cellHeight = 24;
  // Increase top margin inside the plot again to add space above labels
  const marginTop = 30;
  const marginRight = 10;
  const marginBottom = 40; // Space for legend
  const marginLeft = 120; // INCREASED Space for pollster labels
  
  // Calculate available width for cells
  const availableWidth = width - marginLeft - marginRight;
  const cellWidth = availableWidth / parties.length; // Make cell width responsive

  // --- Define Color Scale Explicitly ---
  // Use the same scale for plot fill and legend
  // Revert to scaleSequential RdBu with reversed domain (Red=Positive, Blue=Negative)
  // Try BrBG interpolator instead
  const colorScale = d3.scaleSequential(d3.interpolateBrBG).domain([maxAbs, -maxAbs]);
  /* // scaleDiverging caused TypeErrors
  const colorScale = d3.scaleDiverging()
                      .domain([-maxAbs, 0, maxAbs]) 
                      .interpolator(d3.interpolateBuRd);
  */
  // Log scale outputs for debugging
  console.log(`[houseEffectsHeatmap] colorScale(0): ${colorScale(0)}`);
  console.log(`[houseEffectsHeatmap] colorScale(${maxAbs}): ${colorScale(maxAbs)}`); // Should be Red-ish
  console.log(`[houseEffectsHeatmap] colorScale(${-maxAbs}): ${colorScale(-maxAbs)}`); // Should be Blue-ish
  console.log(`[houseEffectsHeatmap] colorScale(${maxEffect}): ${colorScale(maxEffect)}`); // Color for max positive value in data

  // --- Plotting ---
  const plot = Plot.plot({
    // Use the container width passed in
    width: width, 
    // Calculate height based on fixed cellHeight
    height: marginTop + pollsters.length * cellHeight + marginBottom, 
    marginTop: marginTop,
    marginRight: marginRight,
    marginBottom: marginBottom,
    marginLeft: marginLeft,
    x: { 
        axis: "top", 
        domain: parties, // This now uses the filtered list
        tickSize: 0,
        label: null,
        textAnchor: "middle",
        padding: 0.5 
    },
    y: { 
        axis: "left", 
        domain: pollsters, 
        tickSize: 0,
        label: null
    },
    marks: [
      Plot.cell(filteredHouseEffectsData, { // USE FILTERED DATA
        x: "party",
        y: "pollster",
        fill: d => colorScale(d.house_effect), // Use correct field
        title: (d) => `${d.pollster} - ${d.party}\nEffect: ${d.house_effect.toFixed(1)} pp`, // Use correct field
        width: cellWidth,
        height: cellHeight,
        inset: 0.5 
      })
    ]
  });

  // --- Custom Legend ---
  // Use the calculated availableWidth for the legend base width if possible
  const legendWidth = Math.min(availableWidth, 250); 
  const legendHeight = 8;
  const legendMarginTop = 10;
  const legendSvg = d3.create("svg")
      .attr("width", legendWidth)
      .attr("height", legendHeight + legendMarginTop + 15) // Height for bar + text
      .attr("viewBox", [0, 0, legendWidth, legendHeight + legendMarginTop + 15])
      .style("display", "block")
      // Center legend using auto margins relative to the container width
      .style("margin", `${legendMarginTop}px auto 0 auto`); 

  const defs = legendSvg.append("defs");
  const linearGradient = defs.append("linearGradient")
      .attr("id", "house-effect-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");

  // Use the SAME colorScale for the legend stops
  linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(maxAbs));
  linearGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", colorScale(0)); 
  linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(-maxAbs));

  // Draw the legend rectangle
  legendSvg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#house-effect-gradient)");

  // Add legend labels (no changes needed here)
  legendSvg.append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 10)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .attr("fill", "currentColor")
      .text("Over-estimates");

  legendSvg.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "currentColor")
      .text("0");

  legendSvg.append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 10)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "currentColor")
      .text("Under-estimates");

  // --- Combine Plot and Legend ---
  const container = html`<div>
    ${plot}
    ${legendSvg.node()}
  </div>`;

  return container;
} 