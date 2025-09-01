import { IconCopy, IconMail } from "@tabler/icons-solidjs";
import { onMount } from "solid-js";

import DiscordIcon from "../svgs/DiscordIcon";
import GithubIcon from "../svgs/GithubIcon";
import { ZagTooltip } from "../ZagTooltip";

export function Section5() {
  const tooltip = (
    <div class="text-sm opacity-50 hidden sm:block">click to copy</div>
  );

  let heading!: HTMLDivElement;
  onMount(() => {
    // Parallax effect on heading
    gsap.to(heading, {
      yPercent: 200, // moves downward as you scroll
      ease: "none", // keeps motion linear
      scrollTrigger: {
        trigger: heading, // or the whole section
        start: "top bottom", // when section enters viewport
        end: "bottom top", // when section leaves
        scrub: true, // link animation progress with scroll
      },
    });
  });

  return (
    <div class="h-lvh w-full bg-black/20 flex flex-col justify-center items-center relative">
      <div class="h-[35svh] sm:h-[40svh] rounded-sm overflow-hidden relative">
        <video
          src="/video/aochi2.mp4"
          class="w-full h-full object-cover"
          muted
          autoplay
          loop
        ></video>
        <div class="absolute inset-0 pointer-events-none bg-black/15" />
      </div>
      <p class="text-sm text-neutral-content/50">hire me pls</p>
      <div class="text-neutral-content flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-lg pt-8 pb-16">
        <a
          target="_blank"
          class="flex items-center gap-1 underline cursor-pointer text-sm sm:text-base"
          href="https://github.com/youyoumu"
        >
          <GithubIcon class="size-5" />
          youyoumu
        </a>
        <ZagTooltip
          trigger={
            <div
              class="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText("youyoumu2017");
              }}
            >
              <DiscordIcon class="size-5" />
              <span class="underline text-sm sm:text-base">youyoumu2017</span>
              <IconCopy class="size-4 opacity-50 sm:hidden" />
            </div>
          }
          tooltop={tooltip}
        />
        <ZagTooltip
          trigger={
            <div
              class="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText("youyoumu2024@proton.me");
              }}
            >
              <IconMail class="size-5" />
              <span class="underline text-sm sm:text-base">
                youyoumu2024@proton.me
              </span>
              <IconCopy class="size-4 opacity-50 sm:hidden" />
            </div>
          }
          tooltop={tooltip}
        />
      </div>
      <div
        class="font-bebas-neue tracking-wide absolute top-9/100 text-[15svw] lg:text-[10svw] text-neutral-content right-10/100 opacity-50 pointer-events-none"
        ref={heading}
        style={{
          transform: "translateY(-110%)",
        }}
      >
        CONTACT
      </div>
      <footer class="text-neutral-content text-sm absolute bottom-40 left-0 right-0 flex flex-col gap-1 items-center justify-center">
        <span>
          Cooked 🍙 using{" "}
          <a
            class="underline cursor-pointer"
            href="https://www.solidjs.com/"
            target="_blank"
          >
            SolidJS
          </a>
        </span>
      </footer>
    </div>
  );
}
