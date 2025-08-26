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

  const iconClass = "size-16 sm:size-20";

  const icons = [
    <TypescriptIcon
      class={iconClass}
      path1Props={{
        fill: iconColor,
      }}
    />,
    <DockerIcon
      class={iconClass}
      path1Props={{
        fill: iconColor,
      }}
    />,
    <NixIcon
      class={iconClass}
      path1Props={{
        fill: iconColor,
      }}
      path2Props={{
        fill: iconColor,
      }}
    />,
    <ReactIcon
      class={iconClass}
      g1Props={{
        fill: iconColor,
      }}
    />,
    <NeovimIcon
      class={iconClass}
      path1Props={{
        fill: iconColor,
      }}
    />,
  ];

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
      <div
        ref={section2}
        class="h-svh w-full bg-black/10 text-neutral-content flex flex-col items-center justify-center "
      >
        <div class="flex flex-wrap gap-1 max-w-52 sm:max-w-64">
          {icons[0]}
          {icons[1]}
          {icons[2]}
          {icons[3]}
          {icons[4]}
          <div class="size-20 overflow-visible leading-none">
            <div class="text-lg text-nowrap">youyoumu</div>
            <div class="text-nowrap">WEB DEVELOPER</div>
            <div class="text-nowrap">LINUX ENTHUSIAST</div>
            <div class="text-nowrap opacity-40">WEEB</div>
          </div>
        </div>
      </div>
      <div ref={section3} class="h-svh w-full bg-black/20"></div>
    </>
  );
}
