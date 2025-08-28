import { onMount } from "solid-js";

import { Section2 } from "./Section2";
import { Section3 } from "./Section3";

export function Content() {
  let section1!: HTMLDivElement;
  let section2!: HTMLDivElement;
  let section3!: HTMLDivElement;

  onMount(() => {
    const sections = [section1, section2, section3];
    gsap.to(sections, {
      scrollTrigger: {
        snap: {
          snapTo: 1 / (sections.length - 1),
          duration: 1,
          directional: false,
        },
        scrub: false,
      },
    });
  });

  return (
    <>
      <div ref={section1} class="h-svh w-full">
        test{" "}
      </div>
      <Section2 ref={section2} />
      <Section3 ref={section3} />
    </>
  );
}
