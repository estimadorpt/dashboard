export function contestedBarsPlaceholder() {
  const div = document.createElement("div");
  // Remove min height
  // div.style.minHeight = "6rem"; 
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.textContent = "Contested Bars Placeholder";
  return div;
} 