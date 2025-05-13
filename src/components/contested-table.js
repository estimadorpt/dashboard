import {html} from "npm:htl";
// Keep partyColors import if needed for text styling later
// import { partyColors } from "../config/colors.js"; 

// Function to create the district volatility table
export function contestedTable(contestedSummaryData, { strings, ...options } = {}) {
    const { onDistrictSelect, initialSelectedDistrictId = null, showEnscColumn = true } = options;

    if (!strings) {
      return html`<p class='small note'>Config error: strings not provided.</p>`;
    }
    if (!contestedSummaryData || !contestedSummaryData.districts) {
        return html`<p class='small note'>${strings.contestedTableDataUnavailable}</p>`;
    }

    // --- Data Processing --- 
    const districtsArray = Object.entries(contestedSummaryData.districts)
        .map(([name, data]) => {
            return { name, ...data }; // Just return name and original data
        })
        .sort((a, b) => b.ENSC - a.ENSC); // Default sort by ENSC

    // --- Table Header ---
    const header = html`<thead>
        <tr>
            <th>${strings.contestedTableHeaderDistrict}</th>
            ${showEnscColumn ? html`<th title="${strings.contestedTableHeaderVolatilityTitle}">${strings.contestedTableHeaderVolatility}</th>` : ''} 
        </tr>
    </thead>`;

    // --- Table Body ---
    const body = html`<tbody>
        ${districtsArray.slice(0, 12).map(district => {
            const isSelected = district.name === initialSelectedDistrictId;
            
            const row = html`<tr 
                    class=${isSelected ? 'selected-row' : ''}
                    style="cursor: pointer; ${isSelected ? 'background-color: var(--theme-foreground-focus);' : ''}"
                    onclick=${() => {
                        const newSelectedDistrict = isSelected ? null : district.name;
                        if (onDistrictSelect) {
                            onDistrictSelect(newSelectedDistrict); 
                        }
                        // Parent component handles re-render
                    }}
                >
                    <td>${district.name}</td>
                    ${showEnscColumn ? html`<td>${district.ENSC.toFixed(2)}${strings.contestedTableSeatsSuffix}</td>` : ''}
                </tr>`;
            return row;
        })}
    </tbody>`;

    // --- Styles --- (Keep existing styles, maybe adjust container height)
    const styles = html`<style>
        .contested-table-container {
            /* max-height: 360px; */ /* REMOVE Height limit */
            /* overflow-y: auto; */ /* REMOVE Overflow setting */
        }
        .contested-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9em;
        }
        .contested-table th, .contested-table td {
            padding: 6px 8px;
            text-align: left;
            border-bottom: 1px solid var(--theme-foreground-faint);
        }
        .contested-table th {
            font-weight: bold;
            position: sticky; 
            top: 0;
            background-color: var(--theme-background);
            cursor: default; /* Indicate non-clickable for now */
        }
        .contested-table th[title]:hover {
             /* Optional: Add hover style for sortable headers later */
             /* background-color: var(--theme-foreground-faint); */
        }
        .contested-table tbody tr:hover {
            background-color: var(--theme-foreground-faint);
        }
    </style>`;

    // --- Assemble Table ---
    const tableElement = html`<div class="contested-table-container">
        <table class="contested-table">${header}${body}</table>
    </div>`;

    return html`${styles}${tableElement}`;
} 