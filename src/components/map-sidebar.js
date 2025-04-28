import {html} from "npm:htl";

// Basic placeholder legend - refine later if dynamic data needed
const legendData = [
  {color: "#e41a1c", label: "PS"},
  {color: "#ff7f00", label: "AD"}, // Assuming AD replaces PSD for now
  {color: "#4daf4a", label: "CH"},
  {color: "#984ea3", label: "IL"},
  {color: "#377eb8", label: "BE"},
  {color: "#a65628", label: "CDU"}, // Assuming CDU replaces PCP
  {color: "#f781bf", label: "L"},
  {color: "#999999", label: "PAN"}
];

export function mapSidebar() {
  return html`
    <div>
      <h4>Leading Party</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-bottom: 1rem;">
        ${legendData.map(item => html`
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <span style="width: 12px; height: 12px; background-color: ${item.color}; border-radius: 50%;"></span>
            <span>${item.label}</span>
          </div>
        `)}
      </div>
      <p class="small note">Hover over a district on the map for detailed forecast probabilities.</p>
    </div>
  `;
} 