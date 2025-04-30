import {html} from "npm:htl";
import {contestedTable} from "./contested-table.js";
// Import the actual detail component
import {contestedDetail} from "./contested-detail.js"; 

export function contestedSeatsSection(contestedData) {
    // Use the standard html tag function
    const view = html`<div></div>`; // Initial empty container
    
    // State for selected seat details
    let selectedSeat = null;

    function handleSeatSelect(seat) {
        console.log("[contestedSeatsSection] Seat selected:", seat);
        selectedSeat = seat; // Update the state variable
        update(); // Trigger re-render
    }

    function update() {
        // Render a single card. Inside the card, use a 2-column grid.
        view.replaceChildren(html`
            <div class="card p-4">  
                <h2>Contested Seats & Details</h2>
                <div class="grid grid-cols-2 gap-4 mt-4"> 
                    
                    <div style="overflow-x: auto;"> 
                        ${contestedTable(contestedData, handleSeatSelect)} 
                    </div>
                    
                    
                    <div>
                        ${contestedDetail(selectedSeat)} 
                    </div>
                </div>
            </div>
        `);
    }

    // Initial render
    update();

    return view; // Return the reactive container
} 