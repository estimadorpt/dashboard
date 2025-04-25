import {csv} from "d3-fetch";
import {readFileSync} from "node:fs";

export default {
  load: async () => {
    // In a real scenario, fetch from an API or process model output
    // For now, just read the sample CSV
    const data = await csv("src/data/sample_national_trends.csv", (d) => ({
      date: new Date(d.date), // Parse date string into Date object
      party: d.party,
      metric: d.metric,
      value: +d.value // Convert value to number
    }));
    return data;
  }
}; 