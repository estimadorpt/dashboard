import {html} from "npm:htl";
import { mapSidebar } from "./map-sidebar.js";
import { districtMap } from "./district-map.js";

export function mapWithSidebar(portugalTopoJson, districtForecastData) {

    // State for the CURRENTLY SELECTED/DISPLAYED district data
    let selectedDistrictData = null;
    
    // Create container elements
    const mapContainer = html`<div></div>`; 
    const sidebarContainer = html`<div></div>`;
    const mainContainer = html`
        <div class="grid grid-cols-3 gap-4" style="grid-auto-rows: auto;"> 
            <div class="grid-colspan-2" >${mapContainer}</div>
            <div >${sidebarContainer}</div>
        </div>
    `;

    // Function to update and render sidebar
    const updateSidebar = (dataToShow) => {
        selectedDistrictData = dataToShow;
        while (sidebarContainer.firstChild) {
             sidebarContainer.removeChild(sidebarContainer.firstChild);
        }
        
        // Get current width of the container to pass down
        const sidebarWidth = sidebarContainer.clientWidth || 180; // Default if not measurable yet
        console.log("[mapWithSidebar] Measured sidebar width:", sidebarWidth);

        // Pass width to mapSidebar (which passes it to createBarChartElement)
        sidebarContainer.appendChild(mapSidebar(selectedDistrictData, sidebarWidth));
    };

    // Render map ONCE directly
    const mapElement = districtMap(portugalTopoJson, districtForecastData, {
        // Map width can be independent, maybe based on mapContainer
        width: mapContainer.clientWidth || 600 
    });

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

    // Render sidebar initially
    updateSidebar(null);

    return mainContainer;
} 