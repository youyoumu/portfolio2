import { createBreakpoints } from "@solid-primitives/media";

// Tailwind default breakpoints
const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Custom hook
export function tailwindBreakpoints() {
  return createBreakpoints(breakpoints);
}
