export default {
  load: async () => {
    try {
      console.log("Loader districtForecast.js: Attempting to read data/sample_district_forecast.csv");
      // Read the *source* CSV file content from the data subdirectory
      const csvContent = readFileSync("src/data/sample_district_forecast.csv", "utf-8");
      console.log("Loader districtForecast.js: File read successfully.");
      // ... rest of loader code ...
    } catch (error) {
      console.error("Loader districtForecast.js: Error reading file:", error);
      throw error;
    }
  }
}; 