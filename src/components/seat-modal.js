/**
 * Simple modal placeholder that shows seat data in an alert.
 * @param {object} seatData - The data for the specific seat.
 */
export function showSeatModal(seatData) {
  if (!seatData) {
    alert("No seat data available.");
    return;
  }
  // Format the output slightly for readability
  const output = JSON.stringify(seatData, null, 2); 
  alert(`Seat Details:\n${output}`);
} 