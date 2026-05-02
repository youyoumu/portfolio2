import type { SetStoreFunction } from "solid-js/store";

import { createContext, useContext, type JSX } from "solid-js";
import { createStore } from "solid-js/store";

type Store = {
  musicPlayed: boolean;
  section1: HTMLDivElement | undefined;
  section2: HTMLDivElement | undefined;
  section3: HTMLDivElement | undefined;
  section4: HTMLDivElement | undefined;
  section5: HTMLDivElement | undefined;
};

export const GeneralContext = createContext<[Store, SetStoreFunction<Store>]>();

export function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error("useGeneralContext must be used within a GeneralProvider");
  }
  return context;
}

export function GeneralProvider(props: { children: JSX.Element }) {
  const [store, setStore] = createStore<Store>({
    musicPlayed: false,
    section1: undefined,
    section2: undefined,
    section3: undefined,
    section4: undefined,
    section5: undefined,
  });

  return (
    <GeneralContext.Provider value={[store, setStore]}>{props.children}</GeneralContext.Provider>
  );
}
