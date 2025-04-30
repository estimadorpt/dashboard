import {html} from "npm:htl";
import * as Plot from "@observablehq/plot";
import {partyOrder as configPartyOrder} from "../config/colors.js"; // Use shared party order if needed

// Helper function to create the detail panel
export function contestedDistrictDetail(districtName, districtData, options = {}) {
    const { width = 400 } = options;

    // --- Placeholder Content ---
    if (!districtName || !districtData) {
        return html`<div style="display: flex; align-items: center; justify-content: center; height: 180px; color: var(--theme-foreground-muted); font-style: italic;">
                    Click a district row to see details.
                </div>`;
    }

    const { parties, ENSC, delta2024 } = districtData;

    // --- Header --- 
    const header = html`<div style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--theme-foreground-faint); font-size: 0.9em;">
        <span style="font-weight: bold;">${districtName}</span>
        <span style="margin-left: 1rem;">|</span>
        <span style="margin-left: 1rem;">Volatility (ENSC): ${ENSC.toFixed(2)}</span>
        </div>`;

    // --- Section A: Trend vs 2024 Chart --- 
    let trendChart = null;
    const trendData = Object.entries(delta2024)
        .map(([party, delta]) => ({ party, delta }))
        .filter(d => parties[d.party]) // Only include parties present in the main 'parties' forecast
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)); // Sort by absolute delta desc
    
    // Ensure plot logic only runs if trendData is NOT empty
    if (trendData.length > 0) {
        const maxAbsDelta = trendData.reduce((max, d) => Math.max(max, Math.abs(d.delta)), 0);
        const trendXDomain = [-Math.max(3, maxAbsDelta), Math.max(3, maxAbsDelta)];
        
        try {
            trendChart = Plot.plot({
                width,
                height: trendData.length * 28 + 40,
                marginTop: 5,
                marginLeft: 50,
                marginRight: 10,
                marginBottom: 25,
                x: { 
                    domain: trendXDomain,
                    label: "Seat Change vs 2024",
                    ticks: 7, 
                    tickFormat: d => (d === 0 ? "0" : `${d > 0 ? '+' : ''}${d}`),
                    grid: true
                 },
                y: {
                    domain: trendData.map(d => d.party),
                    label: null
                },
                color: {
                    domain: [-1, 0, 1],
                    range: ["#d7191c", "#bdbdbd", "#1a9641"]
                },
                marks: [
                    Plot.barX(trendData, {
                        x: "delta",
                        y: "party",
                        fill: d => Math.sign(d.delta),
                        title: d => `${d.party}: ${d.delta > 0 ? '+' : ''}${d.delta} vs 2024`
                    }),
                    Plot.text(trendData.filter(d => Math.abs(d.delta) > 0), {
                        x: "delta",
                        y: "party",
                        text: d => `${d.delta > 0 ? '+' : ''}${d.delta}`,
                        dx: d => Math.sign(d.delta) * -5,
                        fill: "white",
                        textAnchor: d => (d.delta > 0 ? "end" : "start"),
                        fontSize: "0.8em",
                        fontWeight: "bold"
                    }),
                    Plot.ruleX([0])
                ]
            });
        } catch(e) { 
            console.error("Trend chart error:", e);
            trendChart = html`<div class=warning>Trend chart error: ${e.message}</div>`; 
        }
    } else {
        // Explicitly set placeholder if trendData is empty
        trendChart = html`<div class="small note" style="height: 80px; display: flex; align-items: center;">No trend data available for this district.</div>`;
    }
    
    // --- Section B: Volatility Profile Chart (Stacked Bar) ---
    let volatilityChart = null;
    const volatilityPlotData = [];
    const volatilityPartyOrder = trendData.map(d => d.party); // Keep same order as Trend chart

    volatilityPartyOrder.forEach(party => {
        const probs = parties[party] || {};
        const probLoss = (probs["-1"] || 0) + (probs["-2"] || 0);
        const probGain = (probs["1"] || 0) + (probs["2"] || 0); // Correct keys used here now
        const calculatedProbZero = Math.max(0, 1 - probLoss - probGain);

        // Add segments in the desired stack order: Loss, No Change, Gain
        if (probLoss > 1e-6) volatilityPlotData.push({ party, type: "Loss", probability: probLoss });
        if (calculatedProbZero > 1e-6) volatilityPlotData.push({ party, type: "No Change", probability: calculatedProbZero });
        if (probGain > 1e-6) volatilityPlotData.push({ party, type: "Gain", probability: probGain });
    });

    // ADD CHECK: Handle potentially empty volatility data
    if (volatilityPlotData.length === 0) {
        volatilityChart = html`<div class="small note" style="height: 80px; display: flex; align-items: center;">No volatility data available for this district/selection.</div>`;
    } else {
        try {
            volatilityChart = Plot.plot({
                width,
                height: volatilityPartyOrder.length * 28 + 50, // Adjusted height
                marginTop: 5,
                marginLeft: 50,
                marginRight: 10,
                marginBottom: 30,
                x: { 
                    label: "Probability vs Modal Forecast",
                    domain: [0, 1],
                    tickFormat: "%"
                 },
                y: {
                    domain: volatilityPartyOrder, // Use same sorted order as Trend chart
                    label: null
                },
                color: {
                    domain: ["Loss", "No Change", "Gain"], // Order determines stack order
                    range: ["#d7191c", "#bdbdbd", "#1a9641"],
                    legend: true,
                    legendOptions: { columns: "100px", tickSize: 0, fontSize: "0.8em" }
                },
                marks: [
                    Plot.barX(volatilityPlotData, {
                        x: "probability",
                        y: "party",
                        fill: "type",
                        offset: "normalize", // Use normalize for stacking to 100%
                        title: d => `${d.party} - ${d.type}: ${(d.probability * 100).toFixed(1)}%` 
                    }),
                    Plot.ruleX([0, 1]) // Add rules at 0% and 100%
                ]
            });
        } catch(e) { volatilityChart = html`<div class=warning>Volatility chart error: ${e.message}</div>`; }
    }

    // --- Assemble Panel ---
    return html`${header}
        <h5 style="font-size: 0.85em; margin-bottom: 0.2rem; color: var(--theme-foreground-muted);">Trend vs 2024</h5>
        ${trendChart}
        <h5 style="font-size: 0.85em; margin-top: 1rem; margin-bottom: 0.2rem; color: var(--theme-foreground-muted);">Volatility vs Modal</h5>
        ${volatilityChart}`;
}
