import {html} from "npm:htl";

// Consistent Party Colors (reuse from table or define centrally)
// TODO: Move partyColors to a central config file (e.g., src/config/colors.js)
const partyColors = {
  "PS": "#e41a1c",
  "AD": "#ff7f00", 
  "CH": "#4daf4a",
  "IL": "#984ea3",
  "BE": "#377eb8",
  "CDU": "#a65628", 
  "L": "#f781bf",
  "PAN": "#999999",
  "Other": "#cccccc" 
};

/**
 * Processes probabilities, aggregates small ones into "Other".
 * (Same logic as in contested-table, consider centralizing)
 * @param {object} probs - The probability object {PARTY: prob, ...}
 * @param {number} threshold - Minimum probability to show individually (e.g., 0.05)
 * @returns {Array<{party: string, prob: number, color: string}>} - Array of parties/probs for the bar
 */
function processProbabilities(probs, threshold = 0.05) {
  let partiesToShow = [];
  let otherProb = 0;

  if (!probs) return []; // Handle case where probs might be undefined

  for (const [party, prob] of Object.entries(probs)) {
    if (prob >= threshold) {
      partiesToShow.push({ party, prob, color: partyColors[party] || partyColors["Other"] });
    } else {
      otherProb += prob;
    }
  }

  if (otherProb > 1e-6) { 
    partiesToShow.push({ party: "Other", prob: otherProb, color: partyColors["Other"] });
  }

  partiesToShow.sort((a, b) => b.prob - a.prob);

  return partiesToShow;
}

export function contestedDetail(selectedSeat) {
  if (!selectedSeat) {
    // Revert to simpler styling, matching mapSidebar placeholder
    return html`
      <div class="small note" style="min-height: 6rem; padding-top: 1rem; text-align: center;">
        Click a row in the table above for details.
      </div>
    `;
  }

  const { district, rank, probs, median_margin_pp } = selectedSeat;
  const processedProbs = processProbabilities(probs);

  // Create the stacked bar
  const probabilityBar = html`
    <div class="detail-prob-bar-container" title="${processedProbs.map(p => `${p.party}: ${(p.prob * 100).toFixed(1)}%`).join('\n')}">
      ${processedProbs.map(p => {
        const sliceWidthPercent = p.prob * 100;
        // Always show text in the detail view if space allows (adjust min width?)
        const showText = sliceWidthPercent > 5; // Show text if > 5% 
        return html`<div class="detail-prob-bar-slice" style="width: ${sliceWidthPercent}%; background-color: ${p.color};">
          ${showText ? html`<span class="detail-prob-bar-text">${p.party} ${(p.prob * 100).toFixed(0)}%</span>` : ''}
        </div>`;
      })}
    </div>
  `;

  // Format the swing text
  const swingText = median_margin_pp !== undefined 
    ? `Typical swing needed: ${median_margin_pp.toFixed(1)} pp` 
    : "Typical swing needed: N/A";

  return html`
    <style>
      .detail-prob-bar-container {
        display: flex;
        width: 100%;
        height: 24px; /* Make bar taller */
        border: 1px solid #555; 
        overflow: hidden;
        background-color: #333; 
        margin-top: 0.5rem; /* Space above bar */
        margin-bottom: 0.75rem; /* Space below bar */
      }
      .detail-prob-bar-slice {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        white-space: nowrap;
        box-sizing: border-box; /* Include border/padding in width */
        border-right: 1px solid rgba(255,255,255,0.2); /* Faint line between slices */
      }
       .detail-prob-bar-slice:last-child {
         border-right: none;
       }
      .detail-prob-bar-text {
        color: white;
        font-size: 0.8em; /* Slightly larger text */
        font-weight: bold;
        text-shadow: 1px 1px 1px rgba(0,0,0,0.8); 
        padding: 0 4px;
      }
    </style>
    <div style="padding: 1rem 0 0 0;">
      <h4>${district} - Seat #${rank}</h4>
      ${probabilityBar}
      <p class="small" style="margin: 0;">${swingText}</p>
    </div>
  `;
} 