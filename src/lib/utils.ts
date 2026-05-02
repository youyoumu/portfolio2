import { type ClassValue, clsx } from "clsx";
import { createSignal } from "solid-js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDynamicViewportDelta() {
  return 60;
}

export function createObjSignal<T>(initialValue: T) {
  const [get, set] = createSignal(initialValue);
  return {
    get,
    set,
  };
}
