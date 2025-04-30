import {html} from "npm:htl";

// Import shared party colors
import { partyColors } from "../config/colors.js";

/**
 * Processes probabilities, aggregates small ones into "Other".
 * @param {object} probs - The probability object {PARTY: prob, ...}
 * @param {number} threshold - Minimum probability to show individually (e.g., 0.05)
 * @returns {Array<{party: string, prob: number, color: string}>} - Array of parties/probs for the bar
 */
function processProbabilities(probs, threshold = 0.05) {
  let partiesToShow = [];
  let otherProb = 0;

  for (const [party, prob] of Object.entries(probs)) {
    if (prob >= threshold) {
      // Use imported partyColors and OTH key for fallback
      partiesToShow.push({ party, prob, color: partyColors[party] || partyColors["OTH"] });
    } else {
      otherProb += prob;
    }
  }

  if (otherProb > 1e-6) { // Add "Other" category if it has significant probability
    // Use imported partyColors and OTH key for "Other" category
    partiesToShow.push({ party: "Other", prob: otherProb, color: partyColors["OTH"] });
  }

  // Sort for consistent order (optional, e.g., by probability descending)
  partiesToShow.sort((a, b) => b.prob - a.prob);

  return partiesToShow;
}

// Accept onSeatSelect callback as the second argument
export function contestedTable(contestedData, onSeatSelect) {
  if (!contestedData || !contestedData.districts) {
    return html`<p>No contested seat data available.</p>`;
  }

  // Flatten the seats data and add district name
  const allSeats = Object.entries(contestedData.districts).flatMap(([districtName, districtData]) => 
    districtData.seats.map(seat => ({...seat, district: districtName}))
  );

  // Sort seats by rank (or maybe uncertainty U? let's stick to rank for now)
  allSeats.sort((a, b) => a.rank - b.rank);

  // Take top N seats (e.g., top 10)
  const topSeats = allSeats.slice(0, 10);

  const table = html`
    <style>
      .prob-bar-table tbody tr:hover {
        background-color: rgba(128, 128, 128, 0.1); /* Light grey hover */
      }
      .prob-bar-container {
        display: flex;
        width: 100%;
        height: 14px; /* Fixed bar height */
        border: 1px solid #555; /* Optional: border around the bar */
        overflow: hidden;
        background-color: #333; /* Background for empty space if any */
      }
      .prob-bar-slice {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        white-space: nowrap;
      }
      .prob-bar-text {
        color: white;
        font-size: 0.7em;
        font-weight: bold;
        text-shadow: 1px 1px 1px rgba(0,0,0,0.7); /* Make text more readable */
        padding: 0 2px;
      }
    </style>
    <table class="table table-striped prob-bar-table" style="width: 100%; font-size: 0.9em;">
      <thead>
        <tr>
          <th>District</th>
          <th>Seat #</th>
          <th style="width: 50%;">Probability Breakdown</th> 
        </tr>
      </thead>
      <tbody>
        ${topSeats.map(seat => {
          const processedProbs = processProbabilities(seat.probs);
          const row = html`<tr>
            <td>${seat.district}</td>
            <td>${seat.rank}</td>
            <td>
              <div class="prob-bar-container" title="${processedProbs.map(p => `${p.party}: ${(p.prob * 100).toFixed(1)}%`).join('\n')}">
                ${processedProbs.map(p => {
                  const sliceWidthPercent = p.prob * 100;
                  // Show text if slice width is roughly > 15% (heuristic)
                  const showText = sliceWidthPercent > 15;
                  return html`<div class="prob-bar-slice" style="width: ${sliceWidthPercent}%; background-color: ${p.color};">
                    ${showText ? html`<span class="prob-bar-text">${(p.prob * 100).toFixed(0)}%</span>` : ''}
                  </div>`;
                })}
              </div>
            </td>
          </tr>`;
          // Add click listener to the row - Call onSeatSelect if provided
          if (typeof onSeatSelect === 'function') {
            row.onclick = () => onSeatSelect(seat);
            row.style.cursor = 'pointer'; // Indicate clickable
          } else {
            // Optional: Keep some default behavior or remove clickability if no callback
             row.onclick = null; 
             row.style.cursor = 'default';
          }
          return row;
        })}
      </tbody>
    </table>
  `;

  return table;
} 