import * as Plot from "../../_node/@observablehq/plot@0.6.17/index.28168f6d.js";
import * as d3 from "../../_npm/d3@7.9.0/e780feca.js";
import { partyOrder, partyColors } from "../config/colors.3c46b7bf.js"; // Use shared party order and colors
import {html} from "../../_npm/htl@0.3.1/72f4716c.js";

export function houseEffectsHeatmap(houseEffectsData, { width } = {}) {
  if (!houseEffectsData || houseEffectsData.length === 0) {
    return html`<div class="small note" style="padding: 1rem; text-align: center;">House effects data not available.</div>`;
  }

  // --- Data processing ---
  const pollsters = [...new Set(houseEffectsData.map(d => d.pollster))].sort(); // Alphabetical pollsters
  const parties = partyOrder; // Use defined party order

  // Calculate max absolute effect for symmetric color scale
  const maxAbs = d3.max(houseEffectsData, d => Math.abs(d.effect));

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
  const marginLeft = 80; // Space for pollster labels
  
  // Calculate available width for cells
  const availableWidth = width - marginLeft - marginRight;
  const cellWidth = availableWidth / parties.length; // Make cell width responsive

  // --- Define Color Scale Explicitly ---
  // Use the same scale for plot fill and legend
  const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([maxAbs, -maxAbs]); // Reversed domain for RdBu interpolator

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
        domain: parties, 
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
      Plot.cell(houseEffectsData, {
        x: "party",
        y: "pollster",
        fill: d => colorScale(d.effect),
        title: (d) => `${d.pollster} - ${d.party}\nEffect: ${d.effect.toFixed(1)} pp`,
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
      .attr("stop-color", colorScale(-maxAbs)); // colorScale expects value from effect domain
  linearGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", colorScale(0)); 
  linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(maxAbs));

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
      .text("Under-estimates");

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
      .text("Over-estimates");

  // --- Combine Plot and Legend ---
  const container = html`<div>
    ${plot}
    ${legendSvg.node()}
  </div>`;

  return container;
} 