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

export function Section3() {
  const iconClass = "size-5 cursor-pointer";
  return (
    <div class="h-svh w-full bg-black/20 flex flex-col justify-center items-center">
      <div class="text-neutral-content">
        <h2 class="text-2xl font-bold">Projects</h2>
        <ul>
          <For each={projects}>
            {(item) => {
              return (
                <li class="flex items-center gap-2">
                  <span>{item.title}</span>
                  <div class="flex items-center">
                    <a href={item.repo} target="_blank" class="opacity-75">
                      <IconBrandGithub class={iconClass} />
                    </a>
                    {item.live && (
                      <a href={item.live} target="_blank" class="opacity-75">
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
          more on my{" "}
          <a href="https://github.com/youyoumu" target="_blank" class="link">
            github
          </a>
        </div>
      </div>
    </div>
  );
}
