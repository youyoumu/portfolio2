import { IconBrandGithub, IconExternalLink } from "@tabler/icons-solidjs";
import { For, onMount } from "solid-js";

import { scrollingChars } from "#/lib/gsap/scrollingChars";

const projects = [
  {
    title: "pretty-ts-errors.nvim",
    repo: "https://github.com/youyoumu/pretty-ts-errors.nvim",
    description:
      "🔴 Make TypeScript errors prettier and human-readable in Neovim 🎀",
  },
  {
    title: "clipmoji",
    repo: "https://github.com/youyoumu/clipmoji",
    description:
      "A lightweight offline clipboard for Discord emojis, favorite GIFs, and custom image links",
    live: "https://clipmoji.youyoumu.my.id/",
  },
  {
    title: "mahiru",
    repo: "https://github.com/youyoumu/clipmoji",
    description:
      "A lightweight offline clipboard for Discord emojis, favorite GIFs, and custom image links",
  },
  {
    title: "discord-clone",
    repo: "https://github.com/youyoumu/discord-clone",
    live: "https://corddis.youyoumu.my.id/",
    description: "React app created with Next.js and Ruby on Rails backend.",
  },
];

const clientProjects = [
  {
    title: "Sisva",
    url: "https://app.sisva.id/",
  },
  {
    title: "POTEHI",
    url: "https://katalog-potehi-six.vercel.app/",
  },
  {
    title: "Nongki",
    url: "https://nongki.vercel.app",
  },
];

export function Section3(props: {
  onMount?: ({ tweenRestart }: { tweenRestart: () => void }) => void;
}) {
  let heading1!: HTMLDivElement;
  let heading2!: HTMLDivElement;
  const iconClass = "size-4.5 cursor-pointer opacity-75";

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
        class="text-nowrap leading-[0.85] font-bebas-neue tracking-wide absolute top-10/100 text-[15svw] lg:text-[10svw] text-neutral-content left-10/100 opacity-50 pointer-events-none"
        style={{
          transform: "translateY(-100%)",
        }}
      >
        WORKS
      </div>
    );
  }

  return (
    <div class="h-lvh w-full bg-black/20 flex flex-col justify-center items-center relative">
      <Heading ref={heading1} />
      <Heading ref={heading2} />
      <div class="text-neutral-content flex flex-col">
        <div>
          <h2 class="text-2xl font-bold">Projects</h2>
          <p class="mb-2 text-sm">Personal projects, open source.</p>
          <ul>
            <For each={projects}>
              {(item) => {
                return (
                  <li class="flex items-center gap-2">
                    <span>{item.title}</span>
                    <div class="flex items-center">
                      <a href={item.repo} target="_blank">
                        <IconBrandGithub class={iconClass} />
                      </a>
                      {item.live && (
                        <a href={item.live} target="_blank">
                          <IconExternalLink class={iconClass} />
                        </a>
                      )}
                    </div>
                  </li>
                );
              }}
            </For>
          </ul>
          <div>
            <a href="https://github.com/youyoumu" target="_blank" class="link">
              see more
            </a>
          </div>
        </div>

        <div class="divider after:bg-neutral-content/25 before:bg-neutral-content/25"></div>

        <div>
          <h2 class="text-xl font-bold">Client Projects</h2>
          <p class=" mb-2 text-sm">Industry projects, freelance work.</p>
          <ul>
            <For each={clientProjects}>
              {(item) => {
                return (
                  <li class="flex items-center gap-2">
                    <span>{item.title}</span>
                    <div class="flex items-center">
                      <a href={item.url} target="_blank">
                        <IconExternalLink class={iconClass} />
                      </a>
                    </div>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </div>
    </div>
  );
}
