import { useGeneralContext } from "#/context/GeneralContext";
import { createSignal, onMount } from "solid-js";

export function RevealingText() {
  const { $general } = useGeneralContext();
  const [wipe, setWipe] = createSignal<HTMLDivElement>();
  const [text, setText] = createSignal<HTMLDivElement>();

  function show() {
    const wipeEl = wipe();
    const textEl = text();
    if (!wipeEl || !textEl) return;

    gsap
      .timeline({
        defaults: { duration: 0.6, ease: "power2.inOut" },
      })
      .to(wipeEl, { scaleX: 1, transformOrigin: "left center" })
      .add(() => {
        textEl.style.visibility = "visible";
      })
      .to(wipeEl, { scaleX: 0, transformOrigin: "right center" })
      .add(() => {
        if ($general.musicPlayed) {
          hide({ delay: 0 });
        } else {
          setTimeout(() => {
            window.addEventListener("touchmove", hide_);
            window.addEventListener("mousemove", hide_);
          }, 2000);
        }
      });
  }

  function hide_() {
    hide();
  }

  let hideTriggered = false;
  function hide({ delay = 2000 } = {}) {
    if (hideTriggered) return;
    if (window.scrollY > 0 && !$general.musicPlayed) return;
    hideTriggered = true;

    const wipeEl = wipe();
    const textEl = text();
    if (!wipeEl || !textEl) return;

    const tl = gsap
      .timeline({
        paused: true,
        defaults: { duration: 0.6, ease: "power2.inOut" },
      })
      .to(wipeEl, { scaleX: 1, transformOrigin: "left center" })
      .add(() => {
        textEl.style.visibility = "hidden";
      })
      .to(wipeEl, { scaleX: 0, transformOrigin: "right center" });

    setTimeout(() => {
      tl.play();
    }, delay);

    window.removeEventListener("touchmove", hide_);
    window.removeEventListener("mousemove", hide_);
  }

  onMount(() => {
    setTimeout(() => {
      if ($general.musicPlayed) return;
      show();
    }, 5000);
  });

  const prompts = [
    "Press play. See what happens.",
    // "Click play. Watch the magic.",
    // "Hit play. Enjoy the show.",
    // "Tap play. See the story.",
  ];

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  return (
    <div class="relative">
      <div
        ref={setText}
        class="invisible text-[5svw] sm:text-[3svw] font-bold backdrop-blur-md px-2 py-0.5 text-nowrap"
      >
        {randomPrompt}
      </div>
      <div ref={setWipe} class="bg-neutral absolute top-0 left-0 size-full scale-x-0"></div>
    </div>
  );
}
