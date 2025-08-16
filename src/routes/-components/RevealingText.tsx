import { onMount } from "solid-js";

import { store } from "#/lib/store";

export function RevealingText() {
  let wipe!: HTMLDivElement;
  let text!: HTMLDivElement;

  function show() {
    gsap
      .timeline({
        defaults: { duration: 0.6, ease: "power2.inOut" },
      })
      .to(wipe, { scaleX: 1, transformOrigin: "left center" })
      .add(() => {
        text.style.visibility = "visible";
      })
      .to(wipe, { scaleX: 0, transformOrigin: "right center" })
      .add(() => {
        if (store.musicPlayed) {
          hide({ delay: 0 });
        } else {
          setTimeout(() => {
            window.addEventListener("mousemove", () => hide(), { once: true });
          }, 2000);
        }
      });
  }

  let hideTriggered = false;
  function hide({ delay = 2000 } = {}) {
    if (hideTriggered) return;
    hideTriggered = true;
    const tl = gsap
      .timeline({
        paused: true,
        defaults: { duration: 0.6, ease: "power2.inOut" },
      })
      .to(wipe, { scaleX: 1, transformOrigin: "left center" })
      .add(() => {
        text.style.visibility = "hidden";
      })
      .to(wipe, { scaleX: 0, transformOrigin: "right center" });

    setTimeout(() => {
      tl.play();
    }, delay);
  }

  onMount(() => {
    setTimeout(() => {
      if (store.musicPlayed) return;
      show();
    }, 5000);
  });

  return (
    <div class="relative">
      <div
        ref={text}
        class="invisible text-3xl font-bold backdrop-blur-md px-2 py-0.5"
      >
        Press play. See what happens.
      </div>
      <div
        ref={wipe}
        class="bg-neutral absolute top-0 left-0 size-full scale-x-0"
      ></div>
    </div>
  );
}
