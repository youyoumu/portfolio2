import type { Signal } from "solid-js";

import { createBreakpoints } from "@solid-primitives/media";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDynamicViewportDelta() {
  return 60;
}

export const hidePortalDiv: (x: HTMLElement) => void = (x) => (x.style.display = "contents");

export function isMobile() {
  return window.innerWidth < 640;
}

export function signalToObj<T>(signal: Signal<T>) {
  return {
    get: signal[0],
    set: signal[1],
  };
}

const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export function tailwindBreakpoints() {
  return createBreakpoints(breakpoints);
}

