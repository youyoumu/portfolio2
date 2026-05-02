import { useGeneralContext } from "#/context/GeneralContext";
import { createEffect } from "solid-js";

import { Section2 } from "./Section2";
import { Section3 } from "./Section3";
import { Section4 } from "./Section4";
import { Section5 } from "./Section5";

export function Content() {
  const { $general, $setGeneral } = useGeneralContext();
  const tweenRestarts: Array<() => void> = [];

  createEffect(() => {
    if (!$general.section1) return;

    gsap.to(
      [
        $general.section1,
        $general.section2,
        $general.section3,
        $general.section4,
        $general.section5,
      ],
      {
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
      },
    );
  });

  return (
    <>
      <div ref={(el) => $setGeneral("section1", el)} class="h-lvh w-full"></div>
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
