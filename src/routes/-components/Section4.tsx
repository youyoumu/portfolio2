import { createSignal } from "solid-js";

import { cn } from "#/lib/utils/cn";

export function Section4() {
  let containerRef: HTMLDivElement | undefined;
  const [x, setX] = createSignal(50);
  const [y, setY] = createSignal(50);
  const [zoom, setZoom] = createSignal(1);

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
        class={cn("overflow-hidden rounded-xl shadow-lg", {
          "cursor-zoom-in": zoom() === 1,
          "cursor-zoom-out": zoom() === 2,
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
            {
              "hover:scale-150": zoom() === 1,
              "hover:scale-250": zoom() === 2,
            },
          )}
          style={{ "transform-origin": `${x()}% ${y()}%` }}
        />
      </div>
    </div>
  );
}
