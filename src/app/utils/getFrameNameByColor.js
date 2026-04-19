export function getCatFrameNameByColor(catColor, state) {
  return `${catColor}_cat_${state.toLowerCase()}.png`;
}

export function getShelfFrameNameByColor(shelfColor) {
  return `shelve_${shelfColor}.png`;
}
