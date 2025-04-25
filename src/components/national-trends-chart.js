import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Re-use party colors (could eventually be moved to a shared config file)
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

export function nationalTrendsChart(trendsData, { width } = {}) {
  console.log("[TrendsChart] Received trendsData:", trendsData);
  if (!trendsData || trendsData.length === 0) {
    console.log("[TrendsChart] Data missing or empty, returning empty fragment.");
    return new DocumentFragment();
  }

  // Separate the mean, low, and high values for plotting
  const meanData = trendsData.filter(d => d.metric === 'vote_share_mean');
  console.log("[TrendsChart] Filtered meanData:", meanData);
  
  // Need to pivot the low/high data for the ribbon plot
  const rawIntervalData = trendsData.filter(d => d.metric !== 'vote_share_mean');
  console.log("[TrendsChart] Filtered rawIntervalData:", rawIntervalData);
  const groupedIntervalData = d3.group(rawIntervalData, d => `${d.date}|${d.party}`);
  console.log("[TrendsChart] Grouped interval data:", groupedIntervalData);

  const intervalData = Array.from(
    groupedIntervalData,
    ([key, values]) => {
      const [dateStr, party] = key.split('|');
      // --- Debug Date Parsing ---
      const attemptedDate = new Date(dateStr);
      if (isNaN(attemptedDate.getTime())) {
          console.warn(`[TrendsChart] Invalid date string found: ${dateStr}`);
      }
      // --- End Debug ---
      const date = attemptedDate; // Use the parsed date
      const low = values.find(d => d.metric === 'vote_share_low95')?.value;
      const high = values.find(d => d.metric === 'vote_share_high95')?.value;
      return { date, party, low, high };
    }
  ).filter(d => d.low !== undefined && d.high !== undefined && !isNaN(d.date.getTime())); // Ensure pairs exist & date is valid
  console.log("[TrendsChart] Pivoted intervalData for ribbon:", intervalData);

  if (meanData.length === 0 || intervalData.length === 0) {
      console.warn("[TrendsChart] Processed data for Plot is empty (mean or interval). Cannot plot.");
      return new DocumentFragment();
  }

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
          label: "National Vote Intention (%)",
          percent: true // Format axis as percent
      },
      x: { 
          label: "Date"
      },
      color: { 
          domain: Object.keys(partyColors).filter(p => p !== 'default'),
          range: Object.values(partyColors).filter(c => c !== partyColors.default),
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
          fillOpacity: 0.2
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