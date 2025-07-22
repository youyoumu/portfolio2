import type { Signal } from "solid-js";

export function signalToObj<T>(signal: Signal<T>) {
  return {
    get: signal[0],
    set: signal[1],
  };
}
