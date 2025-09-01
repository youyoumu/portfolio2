import { onMount } from "solid-js";

import { Section2 } from "./Section2";
import { Section3 } from "./Section3";
import { Section4 } from "./Section4";
import { Section5 } from "./Section5";

export function Content() {
  let section1!: HTMLDivElement;
  let section2!: HTMLDivElement;
  let section3!: HTMLDivElement;
  let section4!: HTMLDivElement;
  let section5!: HTMLDivElement;

  const tweenRestarts: Array<() => void> = [];

  onMount(() => {
    const sections = [section1, section2, section3, section4, section5];
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
  });

  return (
    <>
      <div ref={section1} class="h-lvh w-full"></div>
      <Section2 ref={section2} />
      <Section3
        ref={section3}
        onMount={({ tweenRestart }) => {
          tweenRestarts.push(tweenRestart);
        }}
      />
      <Section4 ref={section4} />
      <Section5 ref={section5} />
    </>
  );
}
