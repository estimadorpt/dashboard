import * as d3 from "npm:d3";

export function contestedHeatstrip(contestedData, {width, strings}) {
  if (!strings) {
    const p = document.createElement("p");
    p.textContent = "Configuration error: strings not provided.";
    return p;
  }
  if (!contestedData || !contestedData.districts) {
    const p = document.createElement("p");
    p.textContent = strings.heatstripNoContestedData;
    return p;
  }

  // --- Data Processing ---
  const allSeats = Object.entries(contestedData.districts).flatMap(([districtName, districtData]) => 
    districtData.seats.map(seat => ({...seat, district: districtName}))
  );

  if (allSeats.length === 0) {
    const p = document.createElement("p");
    p.textContent = strings.heatstripNoSeats;
    return p;
  }

  const districts = [...new Set(allSeats.map(d => d.district))];
  const [minRank, maxRank] = d3.extent(allSeats, d => d.rank);
  if (minRank === undefined || maxRank === undefined) { // Handle case with no ranks
     const p = document.createElement("p");
     p.textContent = strings.heatstripNoRanks;
     return p;
  }
  const ranks = d3.range(minRank, maxRank + 1);

  // Create a lookup map for quick access to seat data by district and rank
  const seatDataMap = new Map(allSeats.map(seat => [`${seat.district}-${seat.rank}`, seat]));

  // Generate data for *all* possible cells in the grid
  const allCellsData = districts.flatMap(district => 
    ranks.map(rank => ({
      district,
      rank,
      seat: seatDataMap.get(`${district}-${rank}`) // Get actual seat data if it exists
    }))
  );

  // --- Dimensions & Scales (adjust margins if needed) ---
  const cellHeight = 4; // Define cell height
  const stripHeight = ranks.length * cellHeight; // Calculate strip height based on ranks
  const legendHeight = 20;
  const marginTop = 5;
  const marginBottom = legendHeight + 15; // Increased space for legend text
  const marginLeft = 5; 
  const marginRight = 5;
  const totalHeight = stripHeight + marginTop + marginBottom;

  const xScale = d3.scaleBand()
    .domain(districts)
    .range([marginLeft, width - marginRight])
    .paddingInner(0.1); 

  const yScale = d3.scaleBand()
    .domain(ranks.reverse()) // Ranks ascending from bottom
    .range([marginTop, marginTop + stripHeight]) // Use calculated stripHeight
    .paddingInner(0); // Remove padding to make cells touch vertically

  const colorScale = d3.scaleSequential(d3.interpolateRgb("#f0f0f0", "#b2182b")) // Light grey to dark red
    .domain([0, 0.5]); 
    
  const emptyCellColor = "transparent"; // Or a faint grey like "#eee" / "#333"

  // --- SVG Setup ---
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", totalHeight)
    .attr("viewBox", [0, 0, width, totalHeight])
    .attr("style", "display: block;");

  // --- Draw Rectangles for All Cells ---
  svg.append("g")
    .attr("class", "heatstrip-cells")
    .selectAll("rect")
    .data(allCellsData) // Use the complete grid data
    .join("rect")
      .attr("x", d => xScale(d.district))
      .attr("y", d => yScale(d.rank))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth()) // Use band height (effectively cellHeight)
      .attr("fill", d => d.seat ? colorScale(d.seat.U) : emptyCellColor) // Use scale or empty color
      .style("cursor", d => d.seat ? "pointer" : "default") // Only show pointer if data exists
      .on("pointerenter", (event, d) => {
        if (d.seat) { // Only log if there's data
          console.log({ district: d.district, rank: d.rank, U: d.seat.U });
        }
      })
    .append("title") // Add tooltip conditionally
      .text(d => d.seat ? strings.heatstripTooltip
                        .replace("{district}", d.district)
                        .replace("{rank}", d.rank)
                        .replace("{probability}", (d.seat.U * 100).toFixed(1))
                        : null);

  // --- Draw Legend --- (same as before, but update Y position based on new stripHeight)
  const legendWidth = Math.min(width * 0.6, 300); 
  const legendX = (width - legendWidth) / 2;
  const legendY = marginTop + stripHeight + 10; // Position legend below the new stripHeight
  const legendSteps = 5;
  const legendScale = d3.scaleLinear().domain([0, 0.5]).range([0, legendWidth]);
  const legendData = d3.range(legendSteps + 1).map(i => i / legendSteps * 0.5);

  const legend = svg.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);

  legend.selectAll("rect")
    .data(d3.pairs(legendData))
    .join("rect")
      .attr("x", d => legendScale(d[0]))
      .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
      .attr("height", 8)
      .attr("fill", d => colorScale(d[0]));
      
  legend.append("text")
      .attr("x", 0)
      .attr("y", 18)
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .text(strings.heatstripLegendMin);

  legend.append("text")
      .attr("x", legendWidth)
      .attr("y", 18)
      .attr("text-anchor", "end")
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .text(strings.heatstripLegendMax);

  return svg.node();
} 