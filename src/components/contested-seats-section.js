import {html} from "npm:htl";
// Import the REFACTORED table and the NEW profile chart
import { contestedTable } from "./contested-table.js";
// Import the NEW detail panel component
import { contestedDistrictDetail } from "./contested-district-detail.js";

// REMOVE OLD component import
// import { contestedDetail } from "./contested-detail.js"; 

// Main component function
export function contestedSeatsSection(contestedSummaryData, { strings, ...options } = {}) {
    if (!strings) {
      return html`<div>Configuration error: strings not provided to contestedSeatsSection.</div>`;
    }
    
    // State managed internally via re-rendering child components
    let selectedDistrictId = null; // Store the NAME of the selected district
    
    const tableContainer = html`<div></div>`; // Placeholder for the table
    const detailContainer = html`<div></div>`; // Placeholder for the detail/profile

    // --- Update Function (Called by Table onClick) --- 
    function updateSelection(newDistrictId) {
        selectedDistrictId = (selectedDistrictId === newDistrictId) ? null : newDistrictId;
        
        // Re-render the detail view with data for the selected district ID
        const districtData = selectedDistrictId ? contestedSummaryData.districts[selectedDistrictId] : null;
        const detailContent = contestedDistrictDetail(selectedDistrictId, districtData, { width: 350, strings }); // Pass name and data
        detailContainer.replaceChildren(detailContent);
        
        // Re-render the table with the new selection state highlighted
        const tableContent = contestedTable(contestedSummaryData, { 
            onDistrictSelect: updateSelection, 
            initialSelectedDistrictId: selectedDistrictId, // Pass current selection to table
            strings // Pass strings down
        });
        tableContainer.replaceChildren(tableContent);
    }

    // --- Initial Render --- 
    const initialTableContent = contestedTable(contestedSummaryData, { 
        onDistrictSelect: updateSelection,
        initialSelectedDistrictId: selectedDistrictId,
        strings // Pass strings down
     });
    // Initially render the detail placeholder
    const initialDetailContent = contestedDistrictDetail(null, null, { width: 350, strings }); // Pass strings down

    tableContainer.append(initialTableContent);
    detailContainer.append(initialDetailContent);

    // --- Layout --- 
    // Use a 2-column grid layout
    const mainContainer = html`<div class="grid grid-cols-2 gap-4" style="align-items: flex-start;">
        <div class="col-span-1">${tableContainer}</div>
        <div class="col-span-1">${detailContainer}</div>
    </div>`;

    return mainContainer;
} 