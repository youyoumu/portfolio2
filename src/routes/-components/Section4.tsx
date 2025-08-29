import { createSignal } from "solid-js";

import { cn } from "#/lib/utils/cn";

type Marker = {
  x: number; // % position
  y: number;
  text: string;
};

const markers: Marker[] = [
  {
    x: 30,
    y: 40,
    text: "This is my keyboard, custom built with lubed switches.",
  },
  { x: 60, y: 70, text: "My monitor setup, perfect for coding + anime." },
  { x: 80, y: 20, text: "A small figure from my favorite series." },
];

export function Section4() {
  let containerRef: HTMLDivElement | undefined;
  const [x, setX] = createSignal(50);
  const [y, setY] = createSignal(50);
  const [zoom, setZoom] = createSignal(1);
  const [hoveredMarker, setHoveredMarker] = createSignal<number | null>(null);

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
          )}
          style={{ "transform-origin": `${x()}% ${y()}%` }}
        >
          {markers.map((m, i) => (
            <div
              class="absolute"
              style={{
                top: `${m.y}%`,
                left: `${m.x}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredMarker(i)}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              {/* dot */}
              <div class="w-4 h-4 rounded-full bg-warning border-2 border-base-100 shadow-md hover:scale-125 transition-transform cursor-pointer"></div>

              {hoveredMarker() === i && (
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 border-1 bg-neutral text-neutral-content text-sm px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
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
