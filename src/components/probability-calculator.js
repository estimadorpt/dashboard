import * as d3 from "npm:d3";

/**
 * Calculates the probability of a given coalition achieving a majority.
 * @param {Array<Object>} drawData - Array of simulation draws, e.g., [{draw: 0, party: 'A', seats: 10}, ...] or wide format [{AD: 10, PS: 9, ...}]
 * @param {Array<string>} coalitionParties - Array of party identifiers in the coalition.
 * @param {number} majorityThreshold - The number of seats required for a majority.
 * @returns {number} - Probability (0 to 1).
 */
export function calculateBlocMajorityProbability(drawData, coalitionParties, majorityThreshold) {
  if (!drawData || drawData.length === 0) return 0;

  // Determine if data is wide or long format
  const isWideFormat = !drawData[0].hasOwnProperty('party') && !drawData[0].hasOwnProperty('draw');

  let blocSeatsPerDraw = [];

  if (isWideFormat) {
    blocSeatsPerDraw = drawData.map(draw =>
      d3.sum(coalitionParties, party => draw[party] || 0)
    );
  } else {
    // Handle long format (assuming 'draw' and 'party' keys exist)
    const seatsByDraw = d3.rollup(
      drawData,
      (v) => d3.sum(v, (d) => coalitionParties.includes(d.party) ? d.seats : 0),
      (d) => d.draw
    );
     blocSeatsPerDraw = Array.from(seatsByDraw.values());
  }

  const totalDraws = blocSeatsPerDraw.length;
  if (totalDraws === 0) return 0;

  const majorityDraws = blocSeatsPerDraw.filter(seats => seats >= majorityThreshold).length;
  return totalDraws > 0 ? (majorityDraws / totalDraws) : 0;
}


/**
 * Calculates the probability that a specific party wins strictly more seats than other specified competitors.
 * Assumes wide format data: [{AD: 10, PS: 9, CH: 5, ...}, ...]
 * @param {Array<Object>} wideDrawData - Array of simulation draws in wide format.
 * @param {string} targetParty - The party to check for winning most seats.
 * @param {Array<string>} competitorParties - Array of parties to compare against.
 * @returns {number} - Probability (0 to 1).
 */
export function calculatePartyMostSeatsProbability(wideDrawData, targetParty, competitorParties) {
    if (!wideDrawData || wideDrawData.length === 0) return 0;

    const totalDraws = wideDrawData.length;
    let mostSeatsCount = 0;

    for (const draw of wideDrawData) {
        const targetSeats = draw[targetParty] || 0;
        let isMost = true;
        for (const competitor of competitorParties) {
            if (targetSeats <= (draw[competitor] || 0)) {
                isMost = false;
                break;
            }
        }
        if (isMost) {
            mostSeatsCount++;
        }
    }

    return totalDraws > 0 ? mostSeatsCount / totalDraws : 0;
}

/**
 * Formats a probability value (0 to 1) into a percentage string,
 * handling edge cases <1% and >99%.
 * @param {number} probability - The probability value (0 to 1).
 * @returns {string} - Formatted percentage string (e.g., "55%", "<1%", ">99%").
 */
export function formatProbabilityPercent(probability) {
    if (probability >= 0.995) { // Would round to 100%
        return ">99%";
    }
    if (probability < 0.005) { // Would round to 0%
        return "<1%";
    }
    // Otherwise, round to nearest integer percentage
    return `${(probability * 100).toFixed(0)}%`;
}

/**
 * Calculates the probability that Bloc A gets strictly more seats than Bloc B.
 * Assumes wide format data: [{AD: 10, PS: 9, CH: 5, ...}, ...]
 * @param {Array<Object>} wideDrawData - Array of simulation draws in wide format.
 * @param {Array<string>} blocAParties - Array of party identifiers for Bloc A.
 * @param {Array<string>} blocBParties - Array of party identifiers for Bloc B.
 * @returns {number} - Probability (0 to 1).
 */
export function calculateBlocAGreaterThanBlocBProbability(wideDrawData, blocAParties, blocBParties) {
    if (!wideDrawData || wideDrawData.length === 0) return 0;

    const totalDraws = wideDrawData.length;
    let blocAWinsCount = 0;

    for (const draw of wideDrawData) {
        const seatsBlocA = d3.sum(blocAParties, party => draw[party] || 0);
        const seatsBlocB = d3.sum(blocBParties, party => draw[party] || 0);

        if (seatsBlocA > seatsBlocB) {
            blocAWinsCount++;
        }
    }

    return totalDraws > 0 ? blocAWinsCount / totalDraws : 0;
} 