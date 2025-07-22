import { createEffect } from "solid-js";

import { horizontalLoop } from "#/lib/gsap/horizontalLoop";
import { cn } from "#/lib/utils/cn";

export function ScrollingText(props: {
  text: string;
  trenshold: number;
  classNames?: {
    container?: string;
    text: string;
  };
}) {
  let containerRef!: HTMLDivElement;
  let tl: ReturnType<typeof horizontalLoop>;
  const clones: HTMLDivElement[] = [];
  const isScrolling = () => props.text.length > props.trenshold;

  function removeScrolling() {
    tl?.kill();
  }

  createEffect(() => {
    if (!isScrolling()) {
      removeScrolling();
      return;
    }

    setTimeout(() => {
      tl = horizontalLoop(clones, {
        repeat: -1,
        speed: 0.1,
      });

      Observer.create({
        onChangeY(self) {
          let factor = 1.5;
          if (self.deltaY < 0) {
            factor *= -1;
          }
          gsap
            .timeline({
              defaults: {
                ease: "expo.out",
              },
            })
            .to(tl, { timeScale: factor * 2.5, duration: 0.2 })
            .to(tl, { timeScale: factor / 2.5, duration: 1 });
        },
      });
    }, 200);

    return removeScrolling;
  });

  return (
    <div
      ref={containerRef}
      class={cn(
        "relative overflow-hidden whitespace-nowrap max-w-full w-full",
        props.classNames?.container,
      )}
    >
      {new Array(isScrolling() ? 5 : 1).fill(0).map((_, i) => (
        <div
          ref={clones[i]}
          class={cn("inline-block pe-2", props?.classNames?.text)}
        >
          {props.text}
        </div>
      ))}
    </div>
  );
}
