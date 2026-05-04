import { useGeneralContext } from "#/context/GeneralContext";
import { useIsMobile } from "#/hooks";
import { cn } from "#/lib/utils";
import { IconCopy, IconMail } from "@tabler/icons-solidjs";
import { useSearch } from "@tanstack/solid-router";
import { type Component } from "solid-js";
import { createMemo, createSignal, onMount } from "solid-js";

import { Heading } from "../../Heading";
import { DiscordIcon, GithubIcon } from "../../svgs";
import { ZagTooltip } from "../../ZagTooltip";

declare const __COMMIT_SHA__: string;

export function Section5() {
  const { $setGeneral } = useGeneralContext();
  const search = useSearch({ from: "/" });
  const email = createMemo(() =>
    search().yym === 0 ? "donnylaukimleng@outlook.com" : "youyoumu2024@proton.me",
  );
  const isMobile = useIsMobile();

  function attachScramble(el: HTMLElement) {
    const original = el.textContent || "";

    el.addEventListener("mouseenter", () => {
      gsap.to(el, {
        duration: 0.25,
        scrambleText: {
          text: original,
          chars: "10",
          revealDelay: 0.1,
          speed: 4,
        },
        overwrite: true,
      });
    });
  }

  const [githubRef, setGithubRef] = createSignal<HTMLSpanElement>();
  const [discordRef, setDiscordRef] = createSignal<HTMLSpanElement>();
  const [emailRef, setEmailRef] = createSignal<HTMLSpanElement>();
  onMount(() => {
    const gh = githubRef();
    const dc = discordRef();
    const em = emailRef();

    if (!isMobile()) {
      const refs = [gh, dc, em].filter((r): r is HTMLSpanElement => !!r);
      refs.forEach(attachScramble);
    }
  });

  return (
    <div
      ref={(el) => $setGeneral("section5", el)}
      class="h-lvh w-full bg-black/20 flex flex-col justify-center items-center relative"
    >
      <div class="blur-shape w-80 h-80 top-1/2 left-1/3 opacity-50"></div>
      <Heading
        style={{ transform: "translateY(-110%)" }}
        class="top-9/100 right-10/100"
        flip={[{ index: 3, direction: "vertical" }]}
      >
        CONTACT
      </Heading>
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
        <ContactItem
          href="https://github.com/youyoumu"
          icon={GithubIcon}
          ref={setGithubRef}
          label="youyoumu"
        />
        <ContactItem
          copyText="youyoumu2017"
          icon={DiscordIcon}
          ref={setDiscordRef}
          label="youyoumu2017"
        />
        <ContactItem copyText={email()} icon={IconMail} ref={setEmailRef} label={email()} />
      </div>

      <footer class="text-neutral-content text-sm absolute bottom-40 left-0 right-0 flex flex-col gap-1 items-center justify-center">
        <span>
          Cooked 🍙 using{" "}
          <a class="underline cursor-pointer" href="https://www.solidjs.com/" target="_blank">
            SolidJS
          </a>
        </span>
        <a
          class="opacity-50 font-jetbrains-mono text-xs underline"
          href={`https://github.com/youyoumu/portfolio2/commit/${__COMMIT_SHA__}`}
          target="_blank"
        >
          {typeof __COMMIT_SHA__ !== "undefined" ? __COMMIT_SHA__.slice(0, 7) : null}
        </a>
      </footer>
    </div>
  );
}

function ContactItem(props: {
  icon: Component<{ class?: string }>;
  ref?: (el: HTMLSpanElement) => void;
  href?: string;
  copyText?: string;
  label: string;
}) {
  const labelClass = cn("underline text-sm sm:text-base leading-tight font-jetbrains-mono");
  const containerClass = cn("flex items-center gap-1 cursor-pointer");

  if (props.href) {
    return (
      <a target="_blank" class={containerClass} href={props.href}>
        <props.icon class="size-5" />
        <span ref={props.ref} class={labelClass}>
          {props.label}
        </span>
      </a>
    );
  }

  if (props.copyText) {
    return (
      <ZagTooltip
        trigger={
          <div
            class={containerClass}
            onClick={async () => {
              if (!props.copyText) return;
              await navigator.clipboard.writeText(props.copyText);
            }}
          >
            <props.icon class="size-5" />
            <span ref={props.ref} class={labelClass}>
              {props.label}
            </span>
            <IconCopy class="size-4 opacity-50 sm:hidden" />
          </div>
        }
        tooltip={<div class="text-sm opacity-50 hidden sm:block">click to copy</div>}
      />
    );
  }

  return null;
}
