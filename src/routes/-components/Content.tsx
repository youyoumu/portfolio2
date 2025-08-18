import { onMount } from "solid-js";

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
      <div ref={section2} class="h-svh w-full bg-black/10"></div>
      <div ref={section3} class="h-svh w-full bg-black/20"></div>
    </>
  );
}
