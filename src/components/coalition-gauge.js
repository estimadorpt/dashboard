import {html} from "npm:htl";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Define coalitions directly
const leftBlocParties = ["PS", "BE", "CDU"];
const rightBlocParties = ["AD", "IL"];
const majorityThreshold = 116;

// Helper function to calculate seat arrays, medians, probabilities
function getBlocStats(drawData, coalitionParties) {
  if (!drawData || drawData.length === 0) {
    return { blocSeats: [], median: 0, probability: 0 };
  }
  // Group seat counts by draw number
  const seatsByDraw = d3.rollup(
    drawData,
    (v) => d3.sum(v, (d) => coalitionParties.includes(d.party) ? d.seats : 0),
    (d) => d.draw
  );

  const blocSeats = Array.from(seatsByDraw.values());
  const median = d3.median(blocSeats) || 0;
  const totalDraws = blocSeats.length;
  if (totalDraws === 0) {
      return { blocSeats: [], median: 0, probability: 0 };
  }
  const majorityDraws = blocSeats.filter(seats => seats >= majorityThreshold).length;
  const probability = totalDraws > 0 ? (majorityDraws / totalDraws) : 0;

  return { blocSeats, median, probability };
}

// Helper function - Accept and use width
function createDensityPlot(dataArray, median, { width } = {}) { // Accept width
    const plotData = dataArray.map(seats => ({ seats }));

    return Plot.plot({
        width, // Use width
        height: 75, // Increased height
        marginLeft: 5, marginRight: 5, marginTop: 20, marginBottom: 5,
        x: { domain: [75, 155], axis: null },
        y: { axis: null },
        marks: [
             Plot.density(plotData, { x: "seats", fill: "grey", fillOpacity: 0.25, bandwidth: 3, thresholds: 40 }),
             Plot.dot([ { value: median } ], { x: "value", symbol: "triangle", fill: "black", r: 5, frameAnchor: "bottom", dy: 2 }),
             Plot.text([ { value: median } ], {
                 x: "value",
                 dy: -8, // Reduced upward offset
                 frameAnchor: "top",
                 text: d => d.value.toFixed(0),
                 fontSize: 10,
                 fill: "black"
             }),
             Plot.ruleX([majorityThreshold], { stroke: "red", strokeDasharray: "2,2", strokeWidth: 1 })
        ]
    });
}

// Main function - Accept and pass width
export function coalitionGauge(drawData, { width } = {}) { // Accept width
  if (!drawData || drawData.length === 0) {
    const placeholderDiv = document.createElement("div");
    placeholderDiv.textContent = "Coalition gauge loading...";
    Object.assign(placeholderDiv.style, {
      display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px"
    });
    return placeholderDiv;
  }

  // Calculate stats for both blocs
  const leftStats = getBlocStats(drawData, leftBlocParties);
  const rightStats = getBlocStats(drawData, rightBlocParties);

  // Log for checking acceptance criteria
  console.log("[CoalitionGauge] Left Bloc - Median:", leftStats.median, "P(>=116):", leftStats.probability);
  console.log("[CoalitionGauge] Right Bloc - Median:", rightStats.median, "P(>=116):", rightStats.probability);

  // Create the plots - Pass width
  const leftPlot = createDensityPlot(leftStats.blocSeats, leftStats.median, { width });
  const rightPlot = createDensityPlot(rightStats.blocSeats, rightStats.median, { width });

  // Assemble the final HTML - Adjust P text margin
  const container = html`
      <div style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
          <!-- Left Bloc Wrapper with Flex Centering -->
          <div style="display: flex; flex-direction: column; align-items: center;">
              <strong style="font-size: 0.85em; display: block; margin-bottom: -5px;">Left Bloc: PS+BE+CDU</strong>
              ${leftPlot}
              <p style="font-size: 0.8em; margin: 3px 0 0 0;">P(≥${majorityThreshold}): ${(leftStats.probability * 100).toFixed(0)}%</p>
          </div>
          <!-- Right Bloc Wrapper with Flex Centering -->
          <div style="display: flex; flex-direction: column; align-items: center;">
              <strong style="font-size: 0.85em; display: block; margin-bottom: -5px;">Right Bloc: AD+IL</strong>
              ${rightPlot}
              <p style="font-size: 0.8em; margin: 3px 0 0 0;">P(≥${majorityThreshold}): ${(rightStats.probability * 100).toFixed(0)}%</p>
          </div>
      </div>
  `;

  return container;
} 