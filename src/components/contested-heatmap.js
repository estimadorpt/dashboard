import * as d3 from "npm:d3";

export function contestedHeatmap(contestedData) {
  if (!contestedData || !contestedData.districts) {
    // Return a simple paragraph if no data, no need for htl here
    const p = document.createElement("p");
    p.textContent = "No contested seat data available for heatmap.";
    return p;
  }

  // Flatten the seats data
  const allSeats = Object.entries(contestedData.districts).flatMap(([districtName, districtData]) => 
    districtData.seats.map(seat => ({...seat, district: districtName})) // Include district for tooltip later
  );

  // Sort by U (descending) and take top N
  allSeats.sort((a, b) => b.U - a.U);
  const topSeats = allSeats.slice(0, 20); // Show maybe 20 blocks

  const width = 200;
  const height = 20;
  
  // Add check for empty topSeats
  if (topSeats.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No seats found for heatmap after filtering/sorting.";
    return p;
  }

  const blockWidth = width / topSeats.length;
  // Restore color scale (or keep red for testing if preferred)
  const colorScale = d3.scaleSequential(d3.interpolateRgb("lightblue", "darkred")).domain([0, 0.5]);

  // Create SVG using D3
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "display: block; margin-top: 1rem;");

  svg.append("title").text("Contested Seats Heatmap (Flip Probability)");

  // Bind data and create rectangles using D3
  svg.selectAll("rect")
    .data(topSeats)
    .join("rect")
      .attr("x", (d, i) => i * blockWidth)
      .attr("y", 0)
      .attr("width", blockWidth) // Use full block width
      .attr("height", height)
      .attr("fill", d => colorScale(d.U)) // Use color scale again
    .append("title") // Add tooltip directly to rect
      .text(d => `District: ${d.district}, Seat: ${d.rank}, Flip Prob: ${(d.U * 100).toFixed(1)}%`);

  return svg.node(); // Return the DOM node
}