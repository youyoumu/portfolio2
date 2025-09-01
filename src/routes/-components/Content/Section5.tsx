import { IconCopy, IconMail } from "@tabler/icons-solidjs";
import { getRouteApi } from "@tanstack/solid-router";
import { onMount } from "solid-js";

import { scrollingChars } from "#/lib/gsap/scrollingChars";

import DiscordIcon from "../svgs/DiscordIcon";
import GithubIcon from "../svgs/GithubIcon";
import { ZagTooltip } from "../ZagTooltip";

export function Section5(props: {
  onMount?: ({ tweenRestart }: { tweenRestart: () => void }) => void;
}) {
  const routeApi = getRouteApi("/");
  const { yym } = routeApi.useSearch()();
  const realName = () => yym === 0;
  const email = () =>
    realName() ? "donnylaukimleng@outlook.com" : "youyoumu2024@proton.me";

  const tooltip = (
    <div class="text-sm opacity-50 hidden sm:block">click to copy</div>
  );

  let heading1!: HTMLDivElement;
  let heading2!: HTMLDivElement;
  onMount(() => {
    // Parallax effect on heading
    const heading = [heading1, heading2];
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

    const { tweenRestart } = scrollingChars({ heading1, heading2 });
    props.onMount?.({
      tweenRestart,
    });
  });

  function Heading(props: { ref: HTMLDivElement }) {
    return (
      <div
        ref={props.ref}
        class="font-bebas-neue tracking-wide absolute top-9/100 text-[15svw] lg:text-[10svw] text-neutral-content right-10/100 opacity-50 pointer-events-none"
        style={{
          transform: "translateY(-110%)",
        }}
      >
        CONTACT
      </div>
    );
  }

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
                navigator.clipboard.writeText(email());
              }}
            >
              <IconMail class="size-5" />
              <span class="underline text-sm sm:text-base">{email()}</span>
              <IconCopy class="size-4 opacity-50 sm:hidden" />
            </div>
          }
          tooltop={tooltip}
        />
      </div>

      <Heading ref={heading1} />
      <Heading ref={heading2} />
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
