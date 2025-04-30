import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {html} from "npm:htl";

// Import shared party colors and order
import { partyColors, partyOrder } from "../config/colors.js";

// Import geoPath for bounds calculation
import { geoPath } from "d3-geo";

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
  const districtProbs = new Map();
  let maxVoteShare;
  let winner;

  for (const [district, parties] of forecastByDistrict) {
    maxVoteShare = -1;
    winner = partyColors.default;
    districtProbs.set(district, parties.map(p => ({ party: p.party, prob: p.vote_share_mean })));
    for (const partyData of parties) {
      if (partyData.vote_share_mean > maxVoteShare) {
        maxVoteShare = partyData.vote_share_mean;
        winner = partyData.party;
      }
    }
    winningParty.set(district, winner);
  }
  // console.log("Winning party map:", winningParty);
  // console.log("District Probs map:", districtProbs);

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
          forecast: districtProbs.get(regionOrDistrictName) || []
      });
  }

  // console.log("Geometry Data Map created:", geometryDataMap);
  if (geometryDataMap.size === 0) {
    console.warn("Geometry Data Map is empty, check processing logic and NAME_1 matching.");
  }

  // NEW: Log sample feature before plotting
  if (districts.features && districts.features.length > 0) {
    console.log("[districtMap] Sample feature data before plot:", districts.features[0]);
    console.log("[districtMap] Sample feature NAME_1:", districts.features[0]?.properties?.NAME_1);
  }

  // 4. Create the Plot
  try {
    // console.log("Attempting Plot.plot...");

    // REMOVED: Plot.pointer state definition
    // const pointer = Plot.pointer(...);

    // Variable to store last hovered key on the plot element itself
    // Initialized here, used in listeners below

    const plot = Plot.plot({
      // width, // Let Plot determine width automatically for now
      // REMOVED: state option
      // state: { pointer }, 
      projection: {
        type: "conic-equal-area",
        domain: districts,
        rotate: [8.5, -39.5] 
      },
      color: {
        // Use imported config
        domain: partyOrder.filter(p => p !== 'OTH'), // Exclude OTH from legend/domain if needed
        range: partyOrder.filter(p => p !== 'OTH').map(p => partyColors[p] || "#888888"), // Map names to colors
        legend: true,
        label: "Leading Party"
      },
      marks: [
        Plot.geo(districts, {
          // Use imported partyColors directly
          fill: (d) => partyColors[geometryDataMap.get(d.properties.NAME_1)?.winner] || "lightgrey",
          stroke: "white",
          strokeWidth: 0.5,
          pointer: "xy",
        })
      ]
    });
    // console.log("Plot.plot succeeded.");

    // REVISED: Click listener uses event.target.__data__ 
    plot.addEventListener("click", (event) => {
        console.log("[districtMap] Plot CLICK event fired.");
        console.log("[districtMap] event.target:", event.target);

        // Check if the __data__ property holds an index (number)
        const featureIndex = typeof event.target?.__data__ === 'number' ? event.target.__data__ : undefined;
        console.log("[districtMap] Index from event.target.__data__:", featureIndex);

        let clickedFeatureKey = undefined;
        let featureDataForDispatch = null;

        // Use the index to look up the feature in the original data array
        if (featureIndex !== undefined && featureIndex >= 0 && featureIndex < districts.features.length) {
            const clickedFeature = districts.features[featureIndex];
            console.log("[districtMap] Feature looked up via index:", clickedFeature);
            clickedFeatureKey = clickedFeature?.properties?.NAME_1;
            console.log(`[districtMap] Key from feature lookup = ${clickedFeatureKey}`);
            
            // Prepare data for dispatch if key is valid
            if (clickedFeatureKey) {
                const regionName = getRegionForIsland(clickedFeatureKey);
                const probs = districtProbs.get(regionName) || [];
                featureDataForDispatch = { id: regionName, probs: probs };
            }
        } else {
             console.log("[districtMap] Click did not yield a valid feature index on event.target.__data__.");
        }

        // --- MANUAL HIGHLIGHT UPDATE --- 
        const selectedKey = featureDataForDispatch?.id ?? null;
        // Store the key on the plot element ONLY for potential external reference if needed
        plot._selectedKey = selectedKey;
        console.log("[districtMap] Setting _selectedKey for highlight comparison:", selectedKey);

        // Find all path elements associated with the district features
        const paths = plot.querySelectorAll("path");
        paths.forEach((path, i) => {
            // Use the index from the loop (i) which *should* correspond to the feature index
            if (i < districts.features.length) { // Basic safety check
                const pathFeatureName = districts.features[i]?.properties?.NAME_1;
                const pathRegionName = getRegionForIsland(pathFeatureName);
                // console.log(`Path ${i}: Region=${pathRegionName}, Selected=${selectedKey}`); // Debug log if needed
                if (pathRegionName === selectedKey) {
                    // Highlight selected: Keep WHITE, make thicker
                    path.style.stroke = "white"; 
                    path.style.strokeWidth = "1.5";
                } else {
                    // Reset others
                    path.style.stroke = "white";
                    path.style.strokeWidth = "0.5";
                }
            }
        });
        // --- END MANUAL HIGHLIGHT UPDATE ---

        // Dispatch event with found data or null
        console.log("[districtMap] Dispatching detail:", featureDataForDispatch);
        plot.dispatchEvent(new CustomEvent("district-click", {
            bubbles: true,
            detail: featureDataForDispatch
        }));
    });

    return plot;
  } catch (error) {
    console.error("Error during Plot.plot execution:", error);
    return new DocumentFragment(); // Return empty on plot error
  }
} 