import { useGeneralContext } from "#/context/GeneralContext";
import { useHoverBlink } from "#/hooks/blink";
import { useSlide } from "#/hooks/slide";
import { track } from "#/lib/umami";
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-solidjs";
import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";

import { Heading } from "../../Heading";

type ShowUpElements = Record<string, HTMLElement | undefined>;
type SlideSideElements = Record<string, HTMLElement | undefined>;

export function Section3() {
  const { $setGeneral } = useGeneralContext();
  const [$showUpElements, $setShowUpElements] = createStore<ShowUpElements>({});
  const [$slideSideElements, $setSlideSideElements] = createStore<SlideSideElements>({});
  const $showUpElementRefs = createMemo(
    () => Object.values($showUpElements).filter(Boolean) as HTMLElement[],
  );
  const $slideSideElementRefs = createMemo(
    () => Object.values($slideSideElements).filter(Boolean) as HTMLElement[],
  );
  const iconClass = "size-4.5 cursor-pointer opacity-75";

  const [sentenceRef, setSentenceRef] = createSignal<HTMLParagraphElement>();
  useHoverBlink(createMemo(() => [sentenceRef()]));
  useSlide(
    createMemo(() => sentenceRef()),
    { targetOpacity: 0.4, start: "top 50%", end: "top 10%" },
  );

  onMount(() => {
    SplitText.create($showUpElementRefs(), {
      type: "words,lines",
      autoSplit: true,
      mask: "lines",
      onSplit: (self) => {
        gsap.fromTo(
          self.words,
          { yPercent: 100 },
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
      $slideSideElementRefs(),
      { xPercent: -100 },
      {
        scrollTrigger: {
          trigger: $slideSideElementRefs(),
          toggleActions: "restart none none none",
        },
        duration: 1.5,
        xPercent: 0,
        stagger: 0.2,
        ease: "expo.out",
      },
    );
  });

  return (
    <div
      ref={(el) => $setGeneral("section3", el)}
      class="h-lvh w-full bg-black/20 flex flex-col justify-center items-center relative overflow-hidden"
    >
      <div class="blur-shape w-96 h-96 -top-20 -left-20"></div>
      <div class="blur-shape w-80 h-80 top-1/2 left-1/3 opacity-50"></div>
      <div class="blur-shape w-[500px] h-[500px] -bottom-40 -right-20"></div>
      <Heading
        style={{ transform: "translateY(-100%)" }}
        class="top-10/100 left-10/100"
        flip={[
          { index: 1, direction: "horizontal" },
          { index: 3, direction: "vertical" },
        ]}
      >
        WORKS
      </Heading>
      <div class="text-neutral-content flex flex-col">
        <div>
          <p ref={setSentenceRef} class="text-xs font-jetbrains-mono max-w-xs mb-4">
            [03] A collection of digital daydreams I’ve managed to turn into real things.
          </p>
          <h2 ref={(el) => $setShowUpElements("1", el)} class="text-3xl font-bold">
            Projects
          </h2>
          <p ref={(el) => $setShowUpElements("2", el)} class="mb-4 text-sm text-neutral-content/75">
            Side projects, open source.
          </p>
          <ul class="overflow-hidden flex flex-col gap-4">
            <ProjectItem
              ref={(el) => $setSlideSideElements("1", el)}
              title="kiku"
              repo="https://github.com/youyoumu/kiku"
              live="https://kiku.youyoumu.my.id/"
              desc="菊 Kiku is modern, fully interactive Anki note type designed for Japanese learners."
              iconClass={iconClass}
            />
            <ProjectItem
              ref={(el) => $setSlideSideElements("2", el)}
              title="mahiru"
              repo="https://github.com/youyoumu/mahiru"
              desc="🌼 Silly Discord bot inspired by the character Shiina Mahiru"
              iconClass={iconClass}
            />
            <ProjectItem
              ref={(el) => $setSlideSideElements("3", el)}
              title="pretty-ts-errors.nvim"
              repo="https://github.com/youyoumu/pretty-ts-errors.nvim"
              desc="🔴 Make TypeScript errors prettier and human-readable in Neovim 🎀"
              iconClass={iconClass}
            />
          </ul>
          <div class="overflow-hidden mt-4">
            <a
              ref={(el) => $setSlideSideElements("4", el)}
              href="https://github.com/youyoumu"
              target="_blank"
              class="link block hover:underline-offset-2 text-lg"
              rel="noopener"
              onClick={() => {
                track("project-item:see-more");
              }}
            >
              see more
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectItem(props: {
  ref?: (el: HTMLLIElement) => void;
  title: string;
  repo?: string;
  live?: string;
  url?: string;
  desc?: string;
  iconClass: string;
}) {
  const [hovered, setHovered] = createSignal(false);
  const [descRef, setDescRef] = createSignal<HTMLDivElement>();

  let descTween: gsap.core.Tween | undefined;
  onMount(() => {
    const ref = descRef();
    if (!ref) return;
    SplitText.create(ref, {
      type: "words,lines",
      autoSplit: true,
      mask: "lines",
      onSplit: (self) => {
        descTween = gsap.fromTo(
          self.lines,
          {
            height: "0",
            yPercent: 100,
          },
          {
            height: "auto",
            duration: 1,
            yPercent: 0,
            ease: "expo.out",
            paused: true,
          },
        );
      },
    });
  });

  createEffect(() => {
    if (hovered()) {
      descTween?.duration(1);
      descTween?.play();
    } else {
      descTween?.duration(0.2);
      descTween?.reverse();
    }
  });

  const onClick = (type: "repo" | "live" | "url") => {
    track(`project-item:${props.title}`, { type });
  };

  return (
    <li ref={props.ref} class="flex flex-col">
      <div
        class="flex items-center gap-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setHovered(false)}
      >
        <span class="text-lg">{props.title}</span>
        <div class="flex items-center">
          {props.repo && (
            <a href={props.repo} target="_blank" rel="noopener" onClick={() => onClick("repo")}>
              <IconBrandGithub class={props.iconClass} />
            </a>
          )}
          {props.live && (
            <a href={props.live} target="_blank" rel="noopener" onClick={() => onClick("live")}>
              <IconExternalLink class={props.iconClass} />
            </a>
          )}
          {props.url && (
            <a href={props.url} target="_blank" rel="noopener" onClick={() => onClick("url")}>
              <IconExternalLink class={props.iconClass} />
            </a>
          )}
        </div>
      </div>
      <div
        ref={(ref) => {
          setDescRef(ref);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setHovered(false)}
        class="text-sm text-neutral-content/60 max-w-3xs"
      >
        {props.desc}
      </div>
    </li>
  );
}
