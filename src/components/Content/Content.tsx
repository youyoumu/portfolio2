import { onMount } from "solid-js";

import { Section2 } from "./Section2";
import { Section3 } from "./Section3";
import { Section4 } from "./Section4";
import { Section5 } from "./Section5";

export function Content(props: {
  onMount?: ({ sections }: { sections: HTMLDivElement[] }) => void;
}) {
  const sections: HTMLDivElement[] = [];
  const tweenRestarts: Array<() => void> = [];

  onMount(() => {
    gsap.to(sections, {
      scrollTrigger: {
        snap: {
          snapTo: 1 / (sections.length - 1),
          duration: 1,
          directional: false,
        },
        scrub: false,
        onSnapComplete() {
          tweenRestarts.forEach((f) => f());
        },
      },
    });

    props.onMount?.({
      sections,
    });
  });

  return (
    <>
      <div ref={sections[0]} class="h-lvh w-full"></div>
      <Section2
        ref={sections[1]}
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
      <Section3
        ref={sections[2]}
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
      <Section4
        ref={sections[3]}
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
      <Section5
        ref={sections[4]}
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
    </>
  );
}
