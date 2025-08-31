import { IconBrandGithub, IconExternalLink } from "@tabler/icons-solidjs";
import { For } from "solid-js";

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

export function Section3() {
  const iconClass = "size-4.5 cursor-pointer opacity-75";
  return (
    <div class="h-lvh w-full bg-black/20 flex flex-col justify-center items-center relative">
      <div class="font-bebas-neue tracking-wide absolute top-10/100 text-[15svw] lg:text-[10svw] text-neutral-content left-10/100 opacity-50 pointer-events-none">
        WORKS
      </div>
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
