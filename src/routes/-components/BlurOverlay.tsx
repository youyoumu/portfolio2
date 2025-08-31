import { onMount } from "solid-js";

export function BlurOverlay() {
  let overlay!: HTMLDivElement;
  let overlay2!: HTMLDivElement;
  let overlay3!: HTMLDivElement;

  onMount(() => {
    gsap.to(overlay, {
      backdropFilter: "blur(10px)",
      ease: "none",
      scrollTrigger: {
        trigger: overlay,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(overlay2, {
      opacity: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: overlay,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(overlay3, {
      opacity: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: overlay,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  return (
    <>
      <div ref={overlay} class="h-svh w-full absolute top-0 left-0"></div>
      <div
        ref={overlay2}
        class="h-svh w-full absolute top-0 left-0 bg-black opacity-0"
      ></div>
      <div
        ref={overlay3}
        class="bg-crt h-svh w-full absolute top-0 left-0 opacity-0"
      ></div>
    </>
  );
}
