import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { partyColors, partyOrder } from "../config/colors.js"; // Import shared config

// Remove local partyColors definition
/*
const partyColors = {
  PS: "#E31A1C", 
  AD: "#FF7F00", 
  CH: "#1F78B4", 
  IL: "#FDBF6F", 
  BE: "#CAB2D6", 
  CDU: "#A6CEE3", 
  OTH: "grey",
  default: "lightgrey"
};
*/

export function nationalTrendsChart(trendsData, { width, strings } = {}) {
  console.log("[TrendsChart] Received trendsData:", trendsData);
  if (!trendsData || trendsData.length === 0 || !strings) {
    console.log("[TrendsChart] Data or strings missing or empty, returning empty fragment.");
    return new DocumentFragment();
  }

  // Ensure all date fields are Date objects
  const typedTrendsData = trendsData.map(d => ({
    ...d,
    date: new Date(d.date) // Parse date string to Date object
  })).filter(d => !isNaN(d.date.getTime())); // Filter out invalid dates

  console.log("[TrendsChart] Parsed dates in typedTrendsData:", typedTrendsData);

  // Separate the mean, low, and high values for plotting
  // Use the data with parsed dates
  const meanData = typedTrendsData.filter(d => d.metric === 'vote_share_mean');
  console.log("[TrendsChart] Filtered meanData:", meanData);
  
  // Need to pivot the low/high data for the ribbon plot
  // Use the data with parsed dates
  const rawIntervalData = typedTrendsData.filter(d => d.metric !== 'vote_share_mean');
  console.log("[TrendsChart] Filtered rawIntervalData:", rawIntervalData);
  // Group by date *object* and party now
  const groupedIntervalData = d3.group(rawIntervalData, d => `${d.date.toISOString()}|${d.party}`); 
  console.log("[TrendsChart] Grouped interval data:", groupedIntervalData);

  const intervalData = Array.from(
    groupedIntervalData,
    ([key, values]) => {
      const [dateISOStr, party] = key.split('|');
      // --- Debug Date Parsing ---
      // const attemptedDate = new Date(dateStr);
      // if (isNaN(attemptedDate.getTime())) {
      //     console.warn(`[TrendsChart] Invalid date string found: ${dateStr}`);
      // }
      // --- End Debug ---
      // const date = attemptedDate; // Use the parsed date
      // Date is already an object from grouping key
      const date = new Date(dateISOStr);
      const low = values.find(d => d.metric === 'vote_share_low')?.value;
      const high = values.find(d => d.metric === 'vote_share_high')?.value;
      return { date, party, low, high };
    }
  ).filter(d => d.low !== undefined && d.high !== undefined); // Date validity already checked
  // console.log("[TrendsChart] Pivoted intervalData for ribbon:", intervalData);
  // Redundant check - already filtered
  // if (meanData.length === 0 || intervalData.length === 0) {
  //     console.warn("[TrendsChart] Processed data for Plot is empty (mean or interval). Cannot plot.");
  //     return new DocumentFragment();
  // }

  // --- Plotting ---
  console.log("[TrendsChart] Attempting Plot.plot...");
  try {
    const plot = Plot.plot({
      width,
      marginTop: 20,
      marginRight: 30,
      marginBottom: 30,
      marginLeft: 40,
      y: { 
          grid: true, 
          label: strings.trendsChartYLabel,
          percent: true // Format axis as percent
      },
      x: { 
          // Explicitly set scale type to utc for dates
          type: "utc", 
          label: strings.trendsChartXLabel
      },
      // Use imported config for color scale
      color: { 
          domain: partyOrder, // Use ordered list for domain
          range: partyOrder.map(p => partyColors[p] || "#888888"), // Map names to colors
          legend: true 
      },
      marks: [
        Plot.ruleY([0]),
        // Credible Interval Ribbon using Plot.areaY
        Plot.areaY(intervalData, { 
          x: "date",
          y1: d => d.low / 100, 
          y2: d => d.high / 100,
          fill: "party",
          fillOpacity: 0.2,
          // Add tip for interval band as well
          tip: {
            format: {
              x: true, // Use default date format
              y: false, // Don't show y value for band
              fill: true, // Show party
              // Custom title for interval
              title: (d) => strings.trendsChartTooltipTitle
                                  .replace("{party}", d.party)
                                  .replace("{low}", d.low.toFixed(1))
                                  .replace("{high}", d.high.toFixed(1))
            }
          }
        }),
        // Mean Trend Line
        Plot.line(meanData, {
          x: "date",
          y: d => d.value / 100, // Convert percentage to proportion
          stroke: "party",
          strokeWidth: 2,
          tip: { 
            format: {
              x: d => d.toLocaleDateString("en-CA"), // Use locale appropriate for dates
              y: ".1%", // Format as percentage
              stroke: true // Display party name
            }
          }
        })
      ]
    });
    console.log("[TrendsChart] Plot.plot succeeded.");
    return plot;
  } catch (error) {
      console.error("[TrendsChart] Error during Plot.plot:", error);
      return new DocumentFragment();
  }
} 