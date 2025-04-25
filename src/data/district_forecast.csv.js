import {csvParse, csvFormat} from "d3-dsv";
import {readFile} from "node:fs/promises";
import process from "node:process";

console.error("[Loader Start] district_forecast.csv.js - Top Level");
try {
  const filePath = "src/data/sample_district_forecast.csv";
  console.error(`[Loader] Reading file: ${filePath}`);
  const csvContent = await readFile(filePath, "utf-8");
  console.error(`[Loader] File read successfully (${csvContent.length} bytes).`);
  
  const parsedData = csvParse(csvContent, (d) => ({
    NAME_1: d.NAME_1, 
    party: d.party,
    vote_share_mean: +d.vote_share_mean, 
    vote_share_low95: +d.vote_share_low95, 
    vote_share_high95: +d.vote_share_high95 
  }));
  console.error(`[Loader] Data parsed (${parsedData.length} rows).`);

  if (!parsedData || parsedData.length === 0) {
      console.error("[Loader] Parsed data is empty! Writing empty string to stdout.");
      process.stdout.write(""); 
  } else {
      const outputCsv = csvFormat(parsedData);
      console.error(`[Loader] Formatted output CSV (${outputCsv.length} bytes).`);
      console.error(`[Loader] Output sample start: ${outputCsv.substring(0, 50)}...`);
      process.stdout.write(outputCsv);
      console.error("[Loader] Wrote CSV to stdout.");
  }
} catch (error) {
    console.error("[Loader Error] district_forecast.csv.js:", error);
    process.exit(1);
}
console.error("[Loader End] district_forecast.csv.js - Top Level");

// No export needed when using top-level await for stdout writing 