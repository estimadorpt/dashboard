import {readFileSync} from "node:fs";

export default {
  load: async () => {
    // Load the TopoJSON file directly
    // Assuming the file exists at this path relative to the project root
    const topojsonData = JSON.parse(readFileSync("src/data/Portugal-Distritos-Ilhas_TopoJSON.json", "utf-8"));
    // You might add validation or preprocessing here later
    return topojsonData;
  }
}; 