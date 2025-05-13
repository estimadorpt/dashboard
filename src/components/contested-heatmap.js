import * as d3 from "npm:d3";

export function contestedHeatmap(contestedData, {strings}) {
  if (!strings) {
    const p = document.createElement("p");
    p.textContent = "Configuration error: strings not provided.";
    return p;
  }
  if (!contestedData || !contestedData.districts) {
    const p = document.createElement("p");
    p.textContent = strings.heatmapNoContestedData;
    return p;
  }

  const allSeats = Object.entries(contestedData.districts).flatMap(([districtName, districtData]) => 
    districtData.seats.map(seat => ({...seat, district: districtName}))
  );

  allSeats.sort((a, b) => b.U - a.U);
  const topSeats = allSeats.slice(0, 20);

  const width = 200;
  const height = 20;
  
  if (topSeats.length === 0) {
    const p = document.createElement("p");
    p.textContent = strings.heatmapNoSeats;
    return p;
  }

  const blockWidth = width / topSeats.length;
  const colorScale = d3.scaleSequential(d3.interpolateRgb("lightblue", "darkred")).domain([0, 0.5]);

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "display: block; margin-top: 1rem;");

  svg.append("title").text(strings.heatmapTitle);

  svg.selectAll("rect")
    .data(topSeats)
    .join("rect")
      .attr("x", (d, i) => i * blockWidth)
      .attr("y", 0)
      .attr("width", blockWidth)
      .attr("height", height)
      .attr("fill", d => colorScale(d.U))
    .append("title")
      .text(d => strings.heatmapTooltip
              .replace("{district}", d.district)
              .replace("{rank}", d.rank)
              .replace("{probability}", (d.U * 100).toFixed(1)));

  return svg.node();
}