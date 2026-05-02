import { useGeneralContext } from "#/context/GeneralContext";
import { scrollingChars } from "#/lib/gsap";
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-solidjs";
import { createMemo, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";

type ShowUpElements = Record<string, HTMLElement | undefined>;
type SlideSideElements = Record<string, HTMLElement | undefined>;

export function Section3() {
  const { $setGeneral, onSnapCompletes } = useGeneralContext();
  const [heading1, setHeading1] = createSignal<HTMLDivElement>();
  const [heading2, setHeading2] = createSignal<HTMLDivElement>();
  const [$showUpElements, $setShowUpElements] = createStore<ShowUpElements>({});
  const [$slideSideElements, $setSlideSideElements] = createStore<SlideSideElements>({});
  const $showUpElementRefs = createMemo(
    () => Object.values($showUpElements).filter(Boolean) as HTMLElement[],
  );
  const $slideSideElementRefs = createMemo(
    () => Object.values($slideSideElements).filter(Boolean) as HTMLElement[],
  );
  const iconClass = "size-4.5 cursor-pointer opacity-75";

  onMount(() => {
    const h1 = heading1();
    const h2 = heading2();
    if (!h1 || !h2) return;

    const heading = [h1, h2];
    gsap.to(heading, {
      yPercent: 200,
      ease: "none",
      scrollTrigger: {
        trigger: heading,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    const { tweenRestart } = scrollingChars({ heading1: h1, heading2: h2 });
    onSnapCompletes.add(tweenRestart);

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
      class="h-lvh w-full bg-black/20 flex flex-col justify-center items-center relative"
    >
      <Heading ref={setHeading1} />
      <Heading ref={setHeading2} />
      <div class="text-neutral-content flex flex-col">
        <div>
          <h2 ref={(el) => $setShowUpElements("1", el)} class="text-2xl font-bold">
            Projects
          </h2>
          <p ref={(el) => $setShowUpElements("2", el)} class="mb-2 text-sm">
            Personal projects, open source.
          </p>
          <ul class="overflow-hidden">
            <ProjectItem
              ref={(el) => $setSlideSideElements("1", el)}
              title="Kiku"
              repo="https://github.com/youyoumu/kiku"
              live="https://kiku.youyoumu.my.id/"
              iconClass={iconClass}
            />
            <ProjectItem
              ref={(el) => $setSlideSideElements("2", el)}
              title="pretty-ts-errors.nvim"
              repo="https://github.com/youyoumu/pretty-ts-errors.nvim"
              iconClass={iconClass}
            />
            <ProjectItem
              ref={(el) => $setSlideSideElements("3", el)}
              title="discord-clone"
              repo="https://github.com/youyoumu/discord-clone"
              live="https://corddis.youyoumu.my.id/"
              iconClass={iconClass}
            />
          </ul>
          <div class="overflow-hidden">
            <a
              ref={(el) => $setSlideSideElements("4", el)}
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
            ref={(el) => $setSlideSideElements("5", el)}
            class="divider after:bg-neutral-content/25 before:bg-neutral-content/25"
          ></div>
        </div>

        <div>
          <h2 ref={(el) => $setShowUpElements("3", el)} class="text-xl font-bold">
            Client Projects
          </h2>
          <p ref={(el) => $setShowUpElements("4", el)} class="mb-2 text-sm">
            Industry projects, freelance work.
          </p>
          <ul class="overflow-hidden">
            <ProjectItem
              ref={(el) => $setSlideSideElements("6", el)}
              title="Sisva"
              url="https://app.sisva.id/"
              iconClass={iconClass}
            />
            <ProjectItem
              ref={(el) => $setSlideSideElements("7", el)}
              title="POTEHI"
              url="https://katalog-potehi-six.vercel.app/"
              iconClass={iconClass}
            />
            <ProjectItem
              ref={(el) => $setSlideSideElements("8", el)}
              title="Nongki"
              url="https://nongki.vercel.app"
              iconClass={iconClass}
            />
          </ul>
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
  iconClass: string;
}) {
  return (
    <li ref={props.ref} class="flex items-center gap-2">
      <span>{props.title}</span>
      <div class="flex items-center">
        {props.repo && (
          <a href={props.repo} target="_blank" rel="noopener">
            <IconBrandGithub class={props.iconClass} />
          </a>
        )}
        {props.live && (
          <a href={props.live} target="_blank" rel="noopener">
            <IconExternalLink class={props.iconClass} />
          </a>
        )}
        {props.url && (
          <a href={props.url} target="_blank" rel="noopener">
            <IconExternalLink class={props.iconClass} />
          </a>
        )}
      </div>
    </li>
  );
}

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
