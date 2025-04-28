import {readFile} from "node:fs/promises";
import process from "node:process";

// export default {
//   load: async () => {
//     // Load the TopoJSON file directly
//     // Assuming the file exists at this path relative to the project root
//     const topojsonData = JSON.parse(readFileSync("src/data/Portugal-Distritos-Ilhas_TopoJSON.json", "utf-8"));
//     // You might add validation or preprocessing here later
//     return topojsonData;
//   }
// };

console.error("[Loader Start] portugal_districts.json.js - Top Level");
try {
  const filePath = "src/data/Portugal-Distritos-Ilhas_TopoJSON.json";
  console.error(`[Loader] Reading file: ${filePath}`);
  // Use readFile from promises API for consistency
  const topojsonData = await readFile(filePath, "utf-8"); 
  console.error(`[Loader] File read successfully (${topojsonData.length} bytes).`);

  // We assume the TopoJSON is valid and directly write it out
  if (!topojsonData || topojsonData.trim() === "") {
      console.error("[Loader] TopoJSON content is empty! Writing empty string to stdout.");
      process.stdout.write("");
  } else {
      console.error(`[Loader] Output sample: ${topojsonData.substring(0, 100)}...`);
      process.stdout.write(topojsonData); 
      console.error("[Loader] Wrote TopoJSON to stdout.");
  }
} catch (error) {
    console.error("[Loader Error] portugal_districts.json.js:", error);
    process.exit(1);
}
console.error("[Loader End] portugal_districts.json.js - Top Level"); 