import { type Component, createSignal, type JSX } from "solid-js";

import { cn } from "#/lib/utils/cn";

type Marker = {
  x: number; // % position
  y: number;
  text: JSX.Element;
};

const markers: Marker[] = [
  {
    x: 54,
    y: 47,
    text: "I use Neovim as my primary code edior. I started using it since January 2025.",
  },
  {
    x: 52,
    y: 68,
    text: "Pressplay APOLLO61 Lite, 60% Keyboard. I use this for gaming and opt out from my split keyboard.",
  },
  {
    x: 44,
    y: 78,
    text: "A custom split keyboard with corne layout. I switch to this not long ago, and I'm getting used to it.",
  },
  {
    x: 84,
    y: 81,
    text: "Vertical mouse because using normal mouse for long period of time hurts my hand. Rexus Cliff.",
  },
  {
    x: 71,
    y: 74,
    text: "Logitect G102",
  },
  {
    x: 19,
    y: 77,
    text: "I do some gaming. Some games that I play in the recent years are: Minecraft, Factorio, Counter Strike 2, Zenless Zone Zero. Although currently I only use this controller for ZZZ and reviewing my Anki cards. Logitech F310.",
  },
  {
    x: 83,
    y: 33,
    text: "This is my main PC, I dual boot NixOS and Windows. I mainly use linux for everything that can be done in linux, and Windows for some games.",
  },
  {
    x: 82,
    y: 51,
    text: "I have a home server. This is my MiniPC, I ssh-ed into it. I use it to host some of my projects, game server (Minecraft and Factorio), and some apps with Docker.",
  },
  {
    x: 21,
    y: 28,
    text: "Steelseries Arctis 5, since 2019.",
  },
  {
    x: 93,
    y: 62,
    text: "This is Anki, a flashcard program that I use to help me learn Japanese language. I started learning since November 2023, and my current level is probably around JLPT N3. I plan to get JLPT N2 test next year.",
  },
];

export function Section4() {
  let containerRef: HTMLDivElement | undefined;
  const [x, setX] = createSignal(50);
  const [y, setY] = createSignal(50);
  const [zoom, setZoom] = createSignal(1);
  const [hoveredMarker, setHoveredMarker] = createSignal<number | null>(null);
  const [showMarker, setShowMarker] = createSignal(false);

  function handleMouseMove(e: MouseEvent) {
    if (!containerRef) return;
    if (rafId) cancelAnimationFrame(rafId);

    const { left, top, width, height } = containerRef.getBoundingClientRect();
    const newX = ((e.clientX - left) / width) * 100;
    const newY = ((e.clientY - top) / height) * 100;
    setX(newX);
    setY(newY);
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

  return (
    <div class="h-svh w-full bg-black/10 flex flex-col justify-center items-center p-4 md:pb-36 sm:p-8">
      <div
        ref={containerRef}
        class={cn("relative overflow-hidden rounded-xl shadow-lg", {
          "cursor-zoom-in": zoom() === 1,
          "cursor-zoom-out": zoom() === 2,

          "hover:[&>img]:scale-150": zoom() === 1,
          "hover:[&>img]:scale-250": zoom() === 2,

          "hover:[&>div]:scale-150": zoom() === 1,
          "hover:[&>div]:scale-250": zoom() === 2,
        })}
        onMouseEnter={() => setShowMarker(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (zoom() === 1) {
            setZoom(2);
          } else if (zoom() === 2) {
            setZoom(1);
          }
        }}
      >
        <img
          src="/img/setup/IMG_20250829_143627_847.jpg"
          class={cn(
            "max-h-[80vh] transition-transform duration-700 ease-in-out",
          )}
          style={{ "transform-origin": `${x()}% ${y()}%` }}
        />

        <div
          class={cn(
            "transition-transform duration-700 ease-in-out absolute top-0 left-0 size-full",
            {
              "opacity-0": !showMarker(),
            },
          )}
          style={{ "transform-origin": `${x()}% ${y()}%` }}
        >
          {markers.map((m, i) => (
            <div
              class={cn("absolute", {
                "z-10": hoveredMarker() === i,
              })}
              style={{
                top: `${m.y}%`,
                left: `${m.x}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredMarker(i)}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              <div class="w-4 h-4 rounded-full bg-warning border-2 border-base-100 shadow-md hover:scale-125 transition-transform"></div>

              {hoveredMarker() === i && (
                <div
                  class={cn(
                    "scale-50 origin-bottom transition-transform duration-700 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 border-1 bg-neutral text-neutral-content text-sm px-2 py-1 rounded-lg shadow-lg w-64",
                    {
                      "-translate-x-6/10": m.x > 90,
                      "-translate-x-8/12": m.x > 90 && zoom() === 2,
                    },
                  )}
                >
                  {m.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
