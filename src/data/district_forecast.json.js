import {readFile} from "node:fs/promises";
import process from "node:process";

console.error("[Loader Start] district_forecast.json.js - Top Level");
try {
  const filePath = "src/data/sample_district_forecast.json";
  console.error(`[Loader] Reading file: ${filePath}`);
  const jsonContent = await readFile(filePath, "utf-8");
  console.error(`[Loader] File read successfully (${jsonContent.length} bytes).`);

  // We assume the JSON is valid and directly write it out
  // Add validation if necessary
  if (!jsonContent || jsonContent.trim() === "") {
      console.error("[Loader] JSON content is empty! Writing empty string to stdout.");
      process.stdout.write("");
  } else {
      console.error(`[Loader] Output sample: ${jsonContent.substring(0, 100)}...`);
      process.stdout.write(jsonContent);
      console.error("[Loader] Wrote JSON to stdout.");
  }
} catch (error) {
    console.error("[Loader Error] district_forecast.json.js:", error);
    process.exit(1);
}
console.error("[Loader End] district_forecast.json.js - Top Level"); 