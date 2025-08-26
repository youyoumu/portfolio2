import { onMount } from "solid-js";

import DockerIcon from "./svgs/DockerIcon";
import NeovimIcon from "./svgs/NeovimIcon";
import NixIcon from "./svgs/NixIcon";
import ReactIcon from "./svgs/ReactIcon";
import TypescriptIcon from "./svgs/TypescriptIcon";

export function Content() {
  let section1!: HTMLDivElement;
  let section2!: HTMLDivElement;
  let section3!: HTMLDivElement;

  const iconColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-neutral-content")
    .trim();

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
      <div ref={section2} class="h-svh w-full bg-black/10">
        <TypescriptIcon
          class="size-16"
          path1Props={{
            fill: iconColor,
          }}
        />
        <DockerIcon
          class="size-16"
          path1Props={{
            fill: iconColor,
          }}
        />
        <NixIcon
          class="size-16"
          path1Props={{
            fill: iconColor,
          }}
          path2Props={{
            fill: iconColor,
          }}
        />
        <ReactIcon
          class="size-16"
          g1Props={{
            fill: iconColor,
          }}
        />
        <NeovimIcon
          class="size-16"
          path1Props={{
            fill: iconColor,
          }}
        />
      </div>
      <div ref={section3} class="h-svh w-full bg-black/20"></div>
    </>
  );
}
