import { scrollingChars } from "#/lib/gsap/scrolling-chars";
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-solidjs";
import { createSignal, For, onMount } from "solid-js";

const projects = [
  {
    title: "Kiku",
    repo: "https://github.com/youyoumu/kiku",
    description: "Modern Anki notes, built like web apps",
    live: "https://kiku.youyoumu.my.id/",
  },
  {
    title: "pretty-ts-errors.nvim",
    repo: "https://github.com/youyoumu/pretty-ts-errors.nvim",
    description: "🔴 Make TypeScript errors prettier and human-readable in Neovim 🎀",
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
  ref: HTMLDivElement;
  onMount?: ({ tweenRestart }: { tweenRestart: () => void }) => void;
}) {
  const [heading1, setHeading1] = createSignal<HTMLDivElement>();
  const [heading2, setHeading2] = createSignal<HTMLDivElement>();
  const showUpElements: HTMLElement[] = [];
  const slideSideElements: HTMLElement[] = [];
  const iconClass = "size-4.5 cursor-pointer opacity-75";

  onMount(() => {
    const h1 = heading1();
    const h2 = heading2();
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
    props.onMount?.({
      tweenRestart,
    });

    SplitText.create(showUpElements, {
      type: "words,lines",
      autoSplit: true,
      mask: "lines",
      onSplit: (self) => {
        gsap.fromTo(
          self.words,
          {
            yPercent: 100,
          },
          {
            scrollTrigger: {
              trigger: self.words,
              toggleActions: "restart none none none",
            },
            duration: 1.5,
            yPercent: 0,
            stagger: 0.2,
            ease: "expo.out",
          },
        );
      },
    });

    gsap.fromTo(
      slideSideElements,
      {
        xPercent: -100,
      },
      {
        scrollTrigger: {
          trigger: slideSideElements,
          toggleActions: "restart none none none",
        },
        duration: 1.5,
        xPercent: 0,
        stagger: 0.2,
        ease: "expo.out",
      },
    );
  });

  function Heading(props: { ref: (el: HTMLDivElement) => void }) {
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
    <div
      ref={props.ref}
      class="h-lvh w-full bg-black/20 flex flex-col justify-center items-center relative"
    >
      <Heading ref={setHeading1} />
      <Heading ref={setHeading2} />
      <div class="text-neutral-content flex flex-col">
        <div>
          <h2 ref={showUpElements[0] as HTMLHeadingElement} class="text-2xl font-bold">
            Projects
          </h2>
          <p ref={showUpElements[1] as HTMLParagraphElement} class="mb-2 text-sm">
            Personal projects, open source.
          </p>
          <ul class="overflow-hidden">
            <For each={projects}>
              {(item, i) => {
                return (
                  <li ref={slideSideElements[i()] as HTMLLIElement} class="flex items-center gap-2">
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
          <div class="overflow-hidden">
            <a
              ref={slideSideElements[projects.length] as HTMLAnchorElement}
              href="https://github.com/youyoumu"
              target="_blank"
              class="link block"
              rel="noopener"
            >
              see more
            </a>
          </div>
        </div>

        <div class="overflow-hidden">
          <div
            ref={slideSideElements[projects.length + 1] as HTMLDivElement}
            class="divider after:bg-neutral-content/25 before:bg-neutral-content/25"
          ></div>
        </div>

        <div>
          <h2 ref={showUpElements[2] as HTMLHeadingElement} class="text-xl font-bold">
            Client Projects
          </h2>
          <p ref={showUpElements[3] as HTMLParagraphElement} class="mb-2 text-sm">
            Industry projects, freelance work.
          </p>
          <ul class="overflow-hidden">
            <For each={clientProjects}>
              {(item, i) => {
                return (
                  <li
                    ref={slideSideElements[2 + i() + projects.length] as HTMLLIElement}
                    class="flex items-center gap-2"
                  >
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
