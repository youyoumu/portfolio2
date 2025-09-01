import { IconCopy, IconMail } from "@tabler/icons-solidjs";

import DiscordIcon from "../svgs/DiscordIcon";
import GithubIcon from "../svgs/GithubIcon";
import { ZagTooltip } from "../ZagTooltip";

export function Section5() {
  const tooltip = (
    <div class="text-sm opacity-50 hidden sm:block">click to copy</div>
  );

  return (
    <div class="h-lvh w-full bg-black/20 flex flex-col justify-center items-center relative">
      <div class="font-bebas-neue tracking-wide absolute top-10/100 text-[15svw] lg:text-[10svw] text-neutral-content right-10/100 opacity-50 pointer-events-none">
        CONTACT
      </div>
      <div class="h-[40svh] sm:h-[40svh] rounded-sm overflow-hidden">
        <video
          src="/video/aochi2.mp4"
          class="w-full h-full object-cover"
          muted
          autoplay
          loop
        ></video>
      </div>
      <p class="text-sm text-neutral-content/50">hire me pls</p>
      <div class="text-neutral-content flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-lg pt-8 pb-16">
        <a
          target="_blank"
          class="flex items-center gap-1 underline cursor-pointer text-sm sm:text-base"
          href="https://github.com/youyoumu"
        >
          <GithubIcon class="size-6" />
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
              <DiscordIcon class="size-6" />
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
              <IconMail class="size-6" />
              <span class="underline text-sm sm:text-base">
                youyoumu2024@proton.me
              </span>
              <IconCopy class="size-4 opacity-50 sm:hidden" />
            </div>
          }
          tooltop={tooltip}
        />
      </div>
    </div>
  );
}
