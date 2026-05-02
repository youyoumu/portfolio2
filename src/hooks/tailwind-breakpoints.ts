import { createBreakpoints } from "@solid-primitives/media";
import { createMemo } from "solid-js";

const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export function useTailwindBreakpoints() {
  return createBreakpoints(breakpoints);
}
export function useIsMobile() {
  const bp = useTailwindBreakpoints();
  return createMemo(() => !bp.sm);
}
