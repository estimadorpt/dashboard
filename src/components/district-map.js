import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";

// Import geoPath for bounds calculation
import { geoPath } from "d3-geo";

// Define a color scale for the parties (customize colors as needed)
const partyColors = {
  PS: "#E31A1C", // Example: Red
  AD: "#FF7F00", // Example: Orange
  CH: "#1F78B4", // Example: Blue
  IL: "#FDBF6F", // Example: Light Orange
  BE: "#CAB2D6", // Example: Light Purple
  CDU: "#A6CEE3", // Example: Light Blue
  OTH: "grey",
  default: "lightgrey" // Fallback color
};

// Helper function to get color based on party
function getColor(party) {
  return partyColors[party] || partyColors.default;
}

// Function to identify island geometries belonging to aggregated regions
// This might need adjustment based on the exact NAME_1 values in your TopoJSON
function getRegionForIsland(islandName) {
  const azoresIslands = ["Ilha do Faial", "Ilha de São Jorge", "Ilha da Graciosa", "Ilha Terceira", "Ilha das Flores", "Ilha do Corvo", "Ilha de São Miguel", "Ilha de Santa Maria", "Ilha do Pico"];
  const madeiraIslands = ["Ilha da Madeira", "Ilha de Porto Santo"];

  if (azoresIslands.includes(islandName)) return "Acores";
  if (madeiraIslands.includes(islandName)) return "Madeira";
  return islandName; // If not an island, return the name itself (continental district)
}


export function districtMap(portugalTopoJson, districtForecast, { width } = {}) {
  // console.log("districtMap called. TopoJSON received?", !!portugalTopoJson, "Forecast received?", !!districtForecast);
  if (!portugalTopoJson || !districtForecast) {
    console.log("Data missing, returning empty fragment.");
    return new DocumentFragment();
  }

  // 1. Extract features from TopoJSON
  let districts = null;
  try {
    districts = topojson.feature(portugalTopoJson, portugalTopoJson.objects.ilhasGeo2);
    // console.log("Extracted GeoJSON features:", districts);
  } catch (error) {
    console.error("Error parsing TopoJSON or extracting features:", error);
    return new DocumentFragment(); 
  }

  if (!districts || !districts.features || districts.features.length === 0) {
    console.error("No valid districts features found in TopoJSON object 'ilhasGeo2'.");
    return new DocumentFragment();
  }

  // Calculate the bounding box of the features
  const path = geoPath();
  const bounds = path.bounds(districts);
  const domain = {
    type: "Polygon",
    coordinates: [[ 
      bounds[0], 
      [bounds[1][0], bounds[0][1]],
      bounds[1],
      [bounds[0][0], bounds[1][1]],
      bounds[0]
    ]]
  };

  // 2. Process forecast data to find the winning party per district/region
  const forecastByDistrict = d3.group(districtForecast, d => d.district_id); 
  // console.log("Forecast grouped by district:", forecastByDistrict);
  const winningParty = new Map();
  let maxVoteShare;
  let winner;

  for (const [district, parties] of forecastByDistrict) {
    maxVoteShare = -1;
    winner = partyColors.default; 
    for (const partyData of parties) {
      if (partyData.vote_share_mean > maxVoteShare) {
        maxVoteShare = partyData.vote_share_mean;
        winner = partyData.party;
      }
    }
    winningParty.set(district, winner);
  }
  // console.log("Winning party map:", winningParty);

  // 3. Create a map to look up forecast data and identify islands
  const geometryDataMap = new Map();
  const islandNames = new Set(); 
  const azoresIslands = new Set(["Ilha do Faial", "Ilha de São Jorge", "Ilha da Graciosa", "Ilha Terceira", "Ilha das Flores", "Ilha do Corvo", "Ilha de São Miguel", "Ilha de Santa Maria", "Ilha do Pico"]);
  const madeiraIslands = new Set(["Ilha da Madeira", "Ilha de Porto Santo"]);

  for (const feature of districts.features) {
      const geometryName = feature.properties.NAME_1; 
      const regionOrDistrictName = getRegionForIsland(geometryName); 
      const forecast = forecastByDistrict.get(regionOrDistrictName); 
      const winnerForRegion = winningParty.get(regionOrDistrictName); 
      // console.log(`GeoName: ${geometryName}, Region: ${regionOrDistrictName}, Winner: ${winnerForRegion}`);

      if (azoresIslands.has(geometryName) || madeiraIslands.has(geometryName)) {
          islandNames.add(geometryName);
      }

      geometryDataMap.set(geometryName, {
          winner: winnerForRegion || partyColors.default,
          forecast: forecast || [] 
      });
  }

  // console.log("Geometry Data Map created:", geometryDataMap);
  if (geometryDataMap.size === 0) {
    console.warn("Geometry Data Map is empty, check processing logic and NAME_1 matching.");
  }

  // 4. Create the Plot
  try {
    // console.log("Attempting Plot.plot...");
    const plot = Plot.plot({
      // width, // Let Plot determine width automatically for now
      // Try Conic Equal Area projection, centered, with domain
      projection: {
        type: "conic-equal-area",
        domain: districts,
        rotate: [8.5, -39.5] // Center roughly on Portugal (lon, lat)
        // parallels: [38, 40] // Optionally add standard parallels if needed
      },
      color: {
        domain: Object.keys(partyColors).filter(p => p !== 'default'),
        range: Object.values(partyColors).filter(c => c !== partyColors.default),
        legend: true,
        label: "Leading Party"
      },
      marks: [
        Plot.geo(districts, {
          fill: (d) => getColor(geometryDataMap.get(d.properties.NAME_1)?.winner),
          stroke: "white",
          strokeWidth: 0.5,
          title: (d) => {
              const name = d.properties.NAME_1;
              const data = geometryDataMap.get(name);
              let forecastString = 'No forecast data';
              if (data?.forecast && data.forecast.length > 0) {
                  forecastString = data.forecast.map(p => {
                      return `  ${p.party}: ${p.vote_share_mean.toFixed(1)}% (${p.vote_share_low95.toFixed(1)}-${p.vote_share_high95.toFixed(1)}%)`;
                  }).join("\n");
              }
              return name + "\n" +
                     "Leading: " + (data?.winner || 'N/A') + "\n" +
                     "Forecast:\n" + forecastString;
          }
        }),
        // Plot.geo(districts, { stroke: "#aaa", strokeWidth: 0.25, fill: "none" })
      ]
    });
    // console.log("Plot.plot succeeded.");
    return plot;
  } catch (error) {
    console.error("Error during Plot.plot execution:", error);
    return new DocumentFragment(); // Return empty on plot error
  }
} 