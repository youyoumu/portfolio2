let minVH = window.innerHeight; // start as svh candidate
let maxVH = window.innerHeight; // start as lvh candidate

window.addEventListener("resize", () => {
  minVH = Math.min(minVH, window.innerHeight);
  maxVH = Math.max(maxVH, window.innerHeight);
});

export function getDynamicViewportDelta() {
  return 60;
  //NOTE: this doesn't work, so i just hardcoded it
  return maxVH - minVH;
}
