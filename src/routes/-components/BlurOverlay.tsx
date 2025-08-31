import { onMount } from "solid-js";

import { isMobile } from "#/lib/utils/isMobile";

export function BlurOverlay() {
  let overlay!: HTMLDivElement;
  let overlay2!: HTMLDivElement;

  onMount(() => {
    if (isMobile()) {
      ScrollTrigger.create({
        trigger: overlay,
        start: "top top",
        end: "bottom top",
        onEnter: () => gsap.set(overlay, { backdropFilter: "blur(10px)" }),
        onLeaveBack: () => gsap.set(overlay, { backdropFilter: "blur(0px)" }),
      });
    } else {
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
    }

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
  });

  return (
    <>
      <div ref={overlay} class="h-svh w-full absolute top-0 left-0"></div>
      <div
        ref={overlay2}
        class="h-svh w-full absolute top-0 left-0 bg-black opacity-0"
      ></div>
    </>
  );
}
