import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { partyColors } from "../config/colors.js"; // For potential future coloring
import { leftBlocParties, rightBlocParties, majorityThreshold } from "../config/blocs.js";

export function coalitionDotPlot(drawData, options = {}) {
  if (!drawData || drawData.length === 0) {
    return document.createTextNode("Coalition data loading...");
  }

  // --- Calculate Bloc Seats per Draw ---
  const seatsByDraw = d3.rollup(
    drawData,
    (v) => {
      const leftSeats = d3.sum(v, (d) => leftBlocParties.includes(d.party) ? d.seats : 0);
      const rightSeats = d3.sum(v, (d) => rightBlocParties.includes(d.party) ? d.seats : 0);
      return { leftSeats, rightSeats };
    },
    (d) => d.draw
  );

  // Convert rollup map to flat array suitable for Plot
  const blocDrawData = Array.from(seatsByDraw.entries()).flatMap(([draw, seats]) => [
    { draw, bloc: "Left Bloc", totalSeats: seats.leftSeats },
    { draw, bloc: "Right Bloc", totalSeats: seats.rightSeats }
  ]);

  // --- Calculate Medians per Bloc ---
  const blocMedians = Array.from(
    d3.rollup(blocDrawData, v => d3.median(v, d => d.totalSeats), d => d.bloc),
    ([bloc, medianSeats]) => ({ bloc, medianSeats })
  );

  // --- Sample Data for Plotting --- 
  // const sampleSize = 2000;
  const sampleSize = 1000; // REDUCE sample size further
  // Shuffle the full data and take the first N points
  const sampledBlocData = d3.shuffle(blocDrawData.slice()).slice(0, sampleSize);

  const blocOrder = ["Left Bloc", "Right Bloc"]; // Define facet order

  // --- Plotting ---
  const plot = Plot.plot({
    height: 300, // INCREASE height to accommodate dodged dots
    marginLeft: 60, // Restore margin for facet labels
    marginRight: 20,
    x: {
        domain: [0, d3.max(blocDrawData, d => d.totalSeats) * 1.05 ?? 230], // Use original data
        label: "Total Seats Won by Bloc", // Restore label
        axis: "bottom",
        ticks: [0, 50, 100, majorityThreshold, 150, 200] // Include majority threshold
    },
    y: { axis: null }, // No explicit y-axis
    fy: {
        domain: blocOrder,
        axis: "left",
        label: null,
        marginBottom: 4
    },
    marks: [
      // Use SAMPLED data for dots
      Plot.dotX(sampledBlocData, Plot.dodgeY({
        x: "totalSeats", 
        fy: "bloc", // RESTORE Facet channel
        anchor: "middle", 
        r: 1, // Make dots much smaller
        fill: "bloc", // RESTORE Color channel
        fillOpacity: 1, // INCREASE opacity
        tip: true, 
        title: d => `${d.bloc}\nTotal Seats: ${d.totalSeats}` // Restore tooltip text
      })), 
      // Median lines - Use original medians, add fy
      Plot.ruleX(blocMedians, {
        x: "medianSeats", 
        fy: "bloc", // RESTORE Facet channel
        stroke: "black",
        strokeWidth: 1.5,
        strokeDasharray: "2,2"
      }),
      // Majority line
      Plot.ruleX([majorityThreshold], {
        stroke: "red", // Keep red for majority threshold
        strokeWidth: 1.5,
        strokeDasharray: "4,2",
        facet: "exclude" // Span across facets
      })
    ],
    ...options
  });

  return plot;
} 