import { useGeneralContext } from "#/context/GeneralContext";
import { createEffect } from "solid-js";

import { Section2 } from "./Section2";
import { Section3 } from "./Section3";
import { Section4 } from "./Section4";
import { Section5 } from "./Section5";

export function Content() {
  const [store, setStore] = useGeneralContext();
  const tweenRestarts: Array<() => void> = [];

  createEffect(() => {
    if (!store.section1) return;

    gsap.to([store.section1, store.section2, store.section3, store.section4, store.section5], {
      scrollTrigger: {
        snap: {
          snapTo: 1 / 4,
          duration: 1,
          directional: false,
        },
        scrub: false,
        onSnapComplete() {
          tweenRestarts.forEach((f) => f());
        },
      },
    });
  });

  return (
    <>
      <div ref={(el) => setStore("section1", el)} class="h-lvh w-full"></div>
      <Section2
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
      <Section3
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
      <Section4
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
      <Section5
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
    </>
  );
}
