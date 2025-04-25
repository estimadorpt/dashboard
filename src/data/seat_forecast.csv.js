import {csv} from "d3-fetch";
import {readFileSync} from "node:fs";

export default {
  load: async () => {
    const data = await csv("src/data/sample_seat_forecast.csv", (d) => ({
      party: d.party,
      seats_median: +d.seats_median,
      seats_low95: +d.seats_low95,
      seats_high95: +d.seats_high95
    }));
    return data;
  }
}; 