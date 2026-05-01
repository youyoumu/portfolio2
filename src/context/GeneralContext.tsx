import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import type { SetStoreFunction } from "solid-js/store";

type Store = { musicPlayed: boolean };

export const GeneralContext = createContext<[Store, SetStoreFunction<Store>]>();

export function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error("useGeneralContext must be used within a GeneralProvider");
  }
  return context;
}

export function GeneralProvider(props: { children: any }) {
  const [store, setStore] = createStore<Store>({ musicPlayed: false });

  return (
    <GeneralContext.Provider value={[store, setStore]}>
      {props.children}
    </GeneralContext.Provider>
  );
}