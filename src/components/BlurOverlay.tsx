import { useIsMobile } from "#/hooks";
import { createEffect, createSignal } from "solid-js";

export function BlurOverlay() {
  const [overlay, setOverlay] = createSignal<HTMLDivElement>();
  const [overlay2, setOverlay2] = createSignal<HTMLDivElement>();
  const isMobile = useIsMobile();

  createEffect(() => {
    const el = overlay();
    const el2 = overlay2();
    if (!el || !el2) return;

    const mobile = isMobile();
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === el || st.trigger === el2) st.kill();
    });

    if (mobile) {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onEnter: () => gsap.set(el, { backdropFilter: "blur(10px)" }),
        onLeaveBack: () => gsap.set(el, { backdropFilter: "blur(0px)" }),
      });
    } else {
      gsap.to(el, {
        backdropFilter: "blur(10px)",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    gsap.to(el2, {
      opacity: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  return (
    <>
      <div ref={setOverlay} class="h-lvh w-full absolute top-0 left-0"></div>
      <div ref={setOverlay2} class="h-lvh w-full absolute top-0 left-0 bg-black opacity-0"></div>
    </>
  );
}
