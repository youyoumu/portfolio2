import { useGeneralContext } from "#/context/GeneralContext";
import { useIsMobile } from "#/hooks";
import { useHoverBlink } from "#/hooks/blink";
import { useSlide } from "#/hooks/slide";
import { track } from "#/lib/umami";
import { cn } from "#/lib/utils";
import { IconZoom } from "@tabler/icons-solidjs";
import { createMemo, createSignal, Show, type JSX } from "solid-js";
import { Portal } from "solid-js/web";

import { Heading } from "../../Heading";
import { MarkerDebug, type TransformValues } from "./MarkerDebug";

type Marker = {
  x: number; // % position
  y: number;
  text: JSX.Element;
  transform?: string;
  tag?: string;
};

const markers: Marker[] = [
  {
    x: 54,
    y: 47,
    text: "I use Neovim as my primary code editor. I’ve been using it since January 2025.",
    tag: "neovim",
  },
  {
    x: 52,
    y: 68,
    text: "Pressplay APOLLO61 Lite, a 60% keyboard. I still use this for gaming, but I switched to a split keyboard for everyday use.",
    tag: "apollo61",
  },
  {
    x: 44,
    y: 78,
    text: "A custom split keyboard with a Corne layout. I switched to this recently and I’m still getting used to it.",
    transform: "rotateX(-15deg) rotateY(20deg) skewX(5deg)",
    tag: "corne-split",
  },
  {
    x: 84,
    y: 81,
    text: "Vertical mouse, because using a regular mouse for long periods hurts my hand. Model: Rexus Cliff.",
    transform: "rotateX(3deg) rotateY(-9deg) rotateZ(11deg) skewX(11deg)",
    tag: "rexus-cliff",
  },
  {
    x: 71,
    y: 74,
    text: "Logitech G102, which I mainly use for FPS games because it’s more precise for aiming compared to my vertical mouse.",
    transform: "rotateY(5deg) rotateZ(-3deg) skewX(-5deg)",
    tag: "g102",
  },
  {
    x: 19,
    y: 77,
    text: "I play some games. In recent years, I’ve played Minecraft, Factorio, Counter-Strike 2, and Zenless Zone Zero. Currently, I mostly use this controller for ZZZ and reviewing my Anki cards. Model: Logitech F310.",
    transform: "rotateY(9deg) rotateZ(-7deg) skewX(-5deg)",
    tag: "f310",
  },
  {
    x: 83,
    y: 33,
    text: "This is my main PC. I dual boot NixOS and Windows. I mainly use Linux for everything it supports, and Windows for some games.",
    transform: "rotateY(-11deg) rotateZ(-4deg) skewX(-5deg)",
    tag: "main-pc",
  },
  {
    x: 82,
    y: 51,
    text: "I also have a home server (a MiniPC I SSH into). I use it to host some of my projects, game servers (Minecraft and Factorio), and apps with Docker.",
    transform: "rotateY(-15deg) rotateZ(3deg)",
    tag: "home-server",
  },
  {
    x: 21,
    y: 28,
    text: "SteelSeries Arctis 5, in use since 2019.",
    transform: "rotateZ(7deg) skewX(9deg)",
    tag: "arctis-5",
  },
  {
    x: 93,
    y: 62,
    text: "This is Anki, a flashcard program I use to learn Japanese. I started in November 2023, and my current level is around JLPT N3. I plan to take the JLPT N2 exam next year.",
    transform: "rotateY(-20deg) rotateZ(5deg) skewX(5deg)",
    tag: "anki",
  },
];

function parseTransform(transform?: string): TransformValues {
  const values: TransformValues = {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    skewX: 0,
    skewY: 0,
  };

  if (!transform) return values;

  const matches = transform.matchAll(/(rotateX|rotateY|rotateZ|skewX|skewY)\(([-\d]+)deg\)/g);
  for (const match of matches) {
    const [, prop, val] = match;
    if (prop in values) {
      values[prop as keyof TransformValues] = parseInt(val);
    }
  }

  return values;
}

export function Section4() {
  const { $setGeneral } = useGeneralContext();
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [x, setX] = createSignal(50);
  const [y, setY] = createSignal(50);
  const [zoom, setZoom] = createSignal(1);
  const [touching, setTouching] = createSignal(false);
  const [hoveredMarker, setHoveredMarker] = createSignal<number | null>(null);
  const [showMarker, setShowMarker] = createSignal(false);
  const isMobile = useIsMobile();

  const [activeMarker, setActiveMarker] = createSignal<number | null>(null);
  const [debugValues, setDebugValues] = createSignal<TransformValues>({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    skewX: 0,
    skewY: 0,
  });

  const [sentenceRef, setSentenceRef] = createSignal<HTMLParagraphElement>();
  useHoverBlink(createMemo(() => [sentenceRef()]));
  useSlide(
    createMemo(() => sentenceRef()),
    { targetOpacity: 0.4, start: "top 95%", end: "top 50%" },
  );

  function toggleZoom() {
    if (zoom() === 1) {
      setZoom(2);
    } else if (zoom() === 2) {
      setZoom(1);
    }
  }

  function handleMouseMove(e: MouseEvent) {
    const el = containerRef();
    if (!el) return;
    if (rafId) cancelAnimationFrame(rafId);

    const { left, top, width, height } = el.getBoundingClientRect();
    const newX = ((e.clientX - left) / width) * 100;
    const newY = ((e.clientY - top) / height) * 100;
    setX(newX);
    setY(newY);
  }

  function handleTouchMove(e: TouchEvent) {
    const el = containerRef();
    if (!el) return;
    const touch = e.touches[0];
    const { left, top, width, height } = el.getBoundingClientRect();
    let newX = ((touch.clientX - left) / width) * 100;
    let newY = ((touch.clientY - top) / height) * 100;

    // clamp between 0 and 100
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    setX(newX);
    setY(newY);

    // detect marker under touch
    const radius = 4; // % tolerance around marker
    let found: number | null = null;
    for (let i = 0; i < markers.length; i++) {
      const m = markers[i];
      if (Math.abs(m.x - newX) < radius && Math.abs(m.y - newY) < radius) {
        found = i;
        break;
      }
    }
    setHoveredMarker(found);
  }

  let rafId: number | null = null;
  function handleMouseLeave() {
    if (rafId) cancelAnimationFrame(rafId);
    const speed = zoom() === 1 ? 0.025 : 0.00125;

    function animate() {
      const currX = x();
      const currY = y();
      const nextX = currX + (50 - currX) * speed;
      const nextY = currY + (50 - currY) * speed;
      setX(nextX);
      setY(nextY);

      if (Math.abs(nextX - 50) < 0.5 && Math.abs(nextY - 50) < 0.5) {
        setX(50);
        setY(50);
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);
    setZoom(1);
    setShowMarker(false);
  }

  const activeTransform = createMemo(() => {
    const values = debugValues();
    let str = "";
    if (values.rotateX !== 0) str += `rotateX(${values.rotateX}deg) `;
    if (values.rotateY !== 0) str += `rotateY(${values.rotateY}deg) `;
    if (values.rotateZ !== 0) str += `rotateZ(${values.rotateZ}deg) `;
    if (values.skewX !== 0) str += `skewX(${values.skewX}deg) `;
    if (values.skewY !== 0) str += `skewY(${values.skewY}deg) `;
    return str.trim();
  });

  return (
    <div
      ref={(el) => $setGeneral("section4", el)}
      class="h-lvh w-full bg-black/10 flex flex-col justify-center items-center p-2 md:pb-36 sm:p-8 relative overflow-hidden"
    >
      <div class="blur-shape w-[500px] h-[500px] -bottom-40 -left-20"></div>
      <div class="relative">
        <div
          class={cn(
            "absolute right-0 -top-8 text-neutral-content opacity-75 text-nowrap sm:hidden flex items-center gap-0.5 text-sm border px-2",
          )}
          onClick={() => {
            toggleZoom();
          }}
        >
          <IconZoom class="size-4" /> {zoom() === 1 ? "1X" : "2X"}
        </div>
        <div
          class={cn(
            "absolute left-1/2 -top-8 sm:-left-4 sm:top-1/2 -translate-x-1/2 sm:-rotate-90 sm:origin-center sm:text-2xl text-base font-bold text-neutral-content opacity-75 text-nowrap",
          )}
        >
          29 August 2025
        </div>
        <div
          ref={setContainerRef}
          class={cn("relative overflow-hidden rounded-xl shadow-lg touch-none", {
            "cursor-zoom-in": zoom() === 1,
            "cursor-zoom-out": zoom() === 2,

            "hover:[&>img]:scale-150": zoom() === 1,
            "[&>img]:scale-150": zoom() === 1 && touching(),
            "hover:[&>img]:scale-250": zoom() === 2,
            "[&>img]:scale-250": zoom() === 2 && touching(),

            "hover:[&>div]:scale-150": zoom() === 1,
            "[&>div]:scale-150": zoom() === 1 && touching(),
            "hover:[&>div]:scale-250": zoom() === 2,
            "[&>div]:scale-250": zoom() === 2 && touching(),
          })}
          onMouseEnter={(e) => {
            setShowMarker(true);
            handleMouseMove(e);
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => {
            setShowMarker(true);
            setTouching(true);
            handleTouchMove(e);
          }}
          onTouchEnd={() => {
            setShowMarker(false);
            setTouching(false);
            setHoveredMarker(null);
          }}
          onTouchCancel={() => {
            setShowMarker(false);
            setTouching(false);
            setHoveredMarker(null);
          }}
          onTouchMove={handleTouchMove}
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => {
            if (isMobile()) return;
            toggleZoom();
          }}
        >
          <img
            src="/img/setup/IMG_20250829_143627_847.jpg"
            class={cn("max-h-[80vh] transition-transform duration-700 ease-in-out touch-none")}
            style={{ "transform-origin": `${x()}% ${y()}%` }}
          />

          <div
            class={cn(
              "transition-transform duration-700 ease-in-out absolute top-0 left-0 size-full",
              {
                "opacity-0": !showMarker() && activeMarker() === null,
              },
            )}
            style={{ "transform-origin": `${x()}% ${y()}%` }}
          >
            {markers.map((m, i) => (
              <div
                class={cn("absolute", {
                  "z-10": hoveredMarker() === i || activeMarker() === i,
                })}
                style={{
                  top: `${m.y}%`,
                  left: `${m.x}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => {
                  track.d(`gallery:1`, { tag: m.tag ?? "" });
                  setHoveredMarker(i);
                }}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={(e) => {
                  if (!import.meta.env.DEV) return;
                  e.stopPropagation();
                  setActiveMarker(i);
                  setDebugValues(parseTransform(m.transform));
                }}
              >
                <div
                  class={cn(
                    "size-[2svw] sm:size-4 rounded-full bg-warning border-[0.4svw] sm:border-2 border-base-100 shadow-md hover:scale-125 transition-transform",
                    {
                      "ring-4 ring-primary ring-offset-2": activeMarker() === i,
                    },
                  )}
                ></div>

                {(hoveredMarker() === i || activeMarker() === i) && (
                  <div class={cn("animate-tooltip-in absolute bottom-full left-1/2 mb-2 z-10")}>
                    <div
                      class={
                        cn(
                          "scale-50 origin-bottom transition-transform duration-700 border-1 bg-neutral text-neutral-content sm:rounded-lg rounded-sm shadow-lg ",
                          "sm:w-64 w-[40svw]",
                          "sm:text-sm",
                          "sm:px-2 sm:py-1",
                          {
                            "w-[30svw]": m.x > 90 || zoom() === 2,
                            "text-[1.5svw]": zoom() === 2,
                            "text-[2.5svw]": zoom() === 1,
                            "px-2 py-1": zoom() === 1,
                            "px-1 py-0.5": zoom() === 2,
                            "-translate-x-1/2": m.x <= 90,
                            "-translate-x-6/10": m.x > 90,
                            "-translate-x-8/12": m.x > 90 && zoom() === 2,
                          },
                        ) + " leading-tight"
                      }
                      style={{
                        transform: `${activeMarker() === i ? activeTransform() : m.transform || ""}`,
                        "transform-style": "preserve-3d",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {import.meta.env.DEV && (
        <Show when={activeMarker() !== null}>
          <Portal>
            <MarkerDebug
              values={debugValues()}
              onChange={setDebugValues}
              onClose={() => setActiveMarker(null)}
            />
          </Portal>
        </Show>
      )}

      <p
        ref={setSentenceRef}
        class="absolute text-xs font-jetbrains-mono max-w-xs bottom-18/100 right-10/100 text-neutral-content text-right"
      >
        [04] Peek into my cozy workspace, where all the magic and a lot of snacking happens.
      </p>
      <Heading
        style={{ transform: "translateY(-110%)" }}
        class="bottom-18/100 sm:bottom-12/100 md:bottom-11/100 lg:bottom-10/100 xl:bottom-8/100 left-10/100"
        flip={[
          { index: 1, direction: "horizontal" },
          { index: 4, direction: "vertical" },
        ]}
      >
        GALLERY
      </Heading>
    </div>
  );
}
