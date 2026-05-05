import { type ClassValue, clsx } from "clsx";
import { createSignal } from "solid-js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let cachedDelta: number | null = null;

export function getDynamicViewportDelta() {
  if (typeof window === "undefined") return 0;
  if (cachedDelta !== null) return cachedDelta;

  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.height = "100lvh";
  div.style.visibility = "hidden";
  div.style.pointerEvents = "none";
  document.body.appendChild(div);

  const lvh = div.getBoundingClientRect().height;
  div.style.height = "100svh";
  const svh = div.getBoundingClientRect().height;

  document.body.removeChild(div);

  cachedDelta = lvh - svh;
  // If the browser doesn't support lvh/svh or it's desktop, delta will be 0.
  // We return the calculated delta or a fallback for mobile.
  return cachedDelta > 0 ? cachedDelta : 60;
}

export function createObjSignal<T>(initialValue: T) {
  const [get, set] = createSignal(initialValue);
  return {
    get,
    set,
  };
}
