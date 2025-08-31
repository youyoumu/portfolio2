import {
  IconBrandDiscord,
  IconBrandGithub,
  IconMail,
} from "@tabler/icons-solidjs";

import { ZagTooltip } from "../ZagTooltip";

export function Section5() {
  const tooltip = (
    <div class="text-sm opacity-50 hidden sm:block">click to copy</div>
  );

  return (
    <div class="h-svh w-full bg-black/20 flex flex-col justify-center items-center relative">
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
      <div class="text-neutral-content flex flex-col sm:flex-row sm:items-center sm:gap-4 text-lg pt-8 pb-16">
        <div class="flex items-center gap-1">
          <IconBrandGithub />
          <a
            target="_blank"
            class="underline cursor-pointer"
            href="https://github.com/youyoumu"
          >
            GitHub
          </a>
        </div>
        <ZagTooltip
          trigger={
            <div
              class="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText("youyoumu2017");
              }}
            >
              <IconBrandDiscord /> <span class="underline">youyoumu2017</span>
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
              <IconMail /> <span class="underline">youyoumu2024@proton.me</span>
            </div>
          }
          tooltop={tooltip}
        />
      </div>
    </div>
  );
}
