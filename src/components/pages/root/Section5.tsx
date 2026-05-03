import { useGeneralContext } from "#/context/GeneralContext";
import { useIsMobile } from "#/hooks";
import { scrollingChars } from "#/lib/gsap";
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
  const { $setGeneral, onSnapCompletes } = useGeneralContext();
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

  const [heading1, setHeading1] = createSignal<HTMLDivElement>();
  const [heading2, setHeading2] = createSignal<HTMLDivElement>();
  const [githubRef, setGithubRef] = createSignal<HTMLSpanElement>();
  const [discordRef, setDiscordRef] = createSignal<HTMLSpanElement>();
  const [emailRef, setEmailRef] = createSignal<HTMLSpanElement>();
  onMount(() => {
    const h1 = heading1();
    const h2 = heading2();
    const gh = githubRef();
    const dc = discordRef();
    const em = emailRef();
    if (!h1 || !h2) return;

    // Parallax effect on heading
    const heading = [h1, h2];
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

    const { tweenRestart } = scrollingChars({ heading1: h1, heading2: h2 });
    onSnapCompletes.add(tweenRestart);

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

      <Heading
        ref={setHeading1}
        style={{ transform: "translateY(-110%)" }}
        class="top-9/100 right-10/100"
      >
        CONTACT
      </Heading>
      <Heading
        ref={setHeading2}
        style={{ transform: "translateY(-110%)" }}
        class="top-9/100 right-10/100"
      >
        CONTACT
      </Heading>
      <footer class="text-neutral-content text-sm absolute bottom-40 left-0 right-0 flex flex-col gap-1 items-center justify-center">
        <span>
          Cooked 🍙 using{" "}
          <a class="underline cursor-pointer" href="https://www.solidjs.com/" target="_blank">
            SolidJS
          </a>
        </span>
        <span class="opacity-50 font-jetbrains-mono text-xs">
          {typeof __COMMIT_SHA__ !== "undefined" ? __COMMIT_SHA__ : null}
        </span>
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
        tooltop={<div class="text-sm opacity-50 hidden sm:block">click to copy</div>}
      />
    );
  }

  return null;
}
