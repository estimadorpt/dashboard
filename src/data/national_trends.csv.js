import {csvParse, csvFormat} from "d3-dsv";
import {readFile} from "node:fs/promises";
import process from "node:process";

console.error("[Loader Start] national_trends.csv.js - Top Level");
try {
  const filePath = "src/data/sample_national_trends.csv"; // Source file
  console.error(`[Loader] Reading file: ${filePath}`);
  const csvContent = await readFile(filePath, "utf-8");
  console.error(`[Loader] File read successfully (${csvContent.length} bytes).`);
  
  // Parse, potentially convert types if needed (though {typed: true} in FileAttachment will handle it)
  const parsedData = csvParse(csvContent, (d) => ({
    date: d.date, // Keep original date string format for csvFormat
    party: d.party,
    metric: d.metric,
    value: +d.value // Ensure value is number if needed downstream, though typed:true helps
  }));
  console.error(`[Loader] Data parsed (${parsedData.length} rows).`);

  if (!parsedData || parsedData.length === 0) {
      console.error("[Loader] Parsed data is empty! Writing empty string to stdout.");
      process.stdout.write(""); 
  } else {
      const outputCsv = csvFormat(parsedData);
      console.error(`[Loader] Formatted output CSV (${outputCsv.length} bytes).`);
      console.error(`[Loader] Output sample: ${outputCsv.substring(0, 100)}...`);
      process.stdout.write(outputCsv);
      console.error("[Loader] Wrote CSV to stdout.");
  }
} catch (error) {
    console.error("[Loader Error] national_trends.csv.js:", error);
    process.exit(1);
}
console.error("[Loader End] national_trends.csv.js - Top Level"); 