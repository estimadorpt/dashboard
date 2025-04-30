import {html} from "npm:htl";
import { districtMap } from "./district-map.js";
import { mapSidebar } from "./map-sidebar.js";

// Accept nationalTrendsData as the third argument
export function mapWithSidebar(portugalTopoJson, districtForecastData, nationalTrendsData) {

    // State for the CURRENTLY SELECTED/DISPLAYED district data
    let selectedDistrictData = null; 

    // Function to update the sidebar content
    function updateSidebar(data) {
        selectedDistrictData = data; 
        // Create sidebar content - pass nationalTrendsData to mapSidebar
        const sidebarContent = mapSidebar(selectedDistrictData, 250, nationalTrendsData); 
        sidebarContainer.replaceChildren(sidebarContent);
    }

    // Container setup (use CSS Grid - CHANGED TO 2 COLUMNS)
    const mainContainer = html`<div class="grid grid-cols-2 gap-4"></div>`; // Changed grid-cols-3 to grid-cols-2
    const mapContainer = html`<div class="col-span-1"></div>`; // Changed col-span-2 to col-span-1
    const sidebarContainer = html`<div class="col-span-1" style="overflow-y: auto; max-height: 600px;"></div>`; // Kept col-span-1
    mainContainer.append(mapContainer, sidebarContainer);

    // Create the SINGLE map instance
    const mapElement = districtMap(portugalTopoJson, districtForecastData, { width: 600 });

    // Attach listener directly to the single map instance
    mapElement.addEventListener("district-click", (event) => {
        // Listener logic remains the same (select/deselect state)
        const clickedDistrictDetail = event.detail; 
        console.log("[mapWithSidebar] district-click received. Detail:", clickedDistrictDetail);
        if (!clickedDistrictDetail) {
            if (selectedDistrictData) updateSidebar(null);
            return;
        }
        const clickedId = clickedDistrictDetail.id;
        if (selectedDistrictData && selectedDistrictData.id === clickedId) updateSidebar(null);
        else updateSidebar(clickedDistrictDetail);
    });

    // Append the single map instance
    mapContainer.appendChild(mapElement);

    // Render sidebar initially (with national data for default view)
    updateSidebar(null); // selectedDistrictData is null initially

    return mainContainer;
} 