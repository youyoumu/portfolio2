import type { SetStoreFunction } from "solid-js/store";

import { createContext, createMemo, useContext, type Accessor, type JSX } from "solid-js";
import { createStore } from "solid-js/store";

type GeneralStore = {
  musicPlayed: boolean;
  section1: HTMLDivElement | undefined;
  section2: HTMLDivElement | undefined;
  section3: HTMLDivElement | undefined;
  section4: HTMLDivElement | undefined;
  section5: HTMLDivElement | undefined;
};

export const GeneralContext = createContext<{
  $general: GeneralStore;
  $setGeneral: SetStoreFunction<GeneralStore>;
  $sections: Accessor<(HTMLDivElement | undefined)[]>;
  onSnapCompletes: Set<() => void>;
}>();

export function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error("useGeneralContext must be used within a GeneralProvider");
  }
  return context;
}

export function GeneralProvider(props: { children: JSX.Element }) {
  const [$general, $setGeneral] = createStore<GeneralStore>({
    musicPlayed: false,
    section1: undefined,
    section2: undefined,
    section3: undefined,
    section4: undefined,
    section5: undefined,
  });

  const $sections = createMemo(() => [
    $general.section1,
    $general.section2,
    $general.section3,
    $general.section4,
    $general.section5,
  ]);

  return (
    <GeneralContext.Provider
      value={{
        $general,
        $setGeneral,
        $sections,
        onSnapCompletes: new Set(),
      }}
    >
      {props.children}
    </GeneralContext.Provider>
  );
}
