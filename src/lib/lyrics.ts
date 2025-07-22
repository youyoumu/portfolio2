import { debounce } from "@solid-primitives/scheduled";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

import { badAppleLyrics } from "./vars";
gsap.registerPlugin(SplitText);

const offset = -0.9;

export class Lyrics {
  container: HTMLElement = document.createElement("div");
  lyrics = badAppleLyrics.map((value) => ({
    ...value,
    startTime: value.startTime + offset,
  }));
  currentIndex = -1;
  split?: SplitText;

  constructor() {
    this.container.classList.add(
      "text-7xl",
      "text-gray-300",
      "font-yuji-syuku",
      "invisible",
      "flex",
      "[&>div]:flex!",
      "[&>div]:flex-row-reverse!",
      "[&>div>div]:w-22",
      "[&>div>div>div]:mix-blend-difference",
    );
  }

  render(currentTime: number) {
    const line = this.lyrics[this.currentIndex];
    const endTime =
      line?.endTime ??
      this.lyrics[this.currentIndex + 1]?.startTime ??
      Infinity;

    // If current line has ended, remove it
    if (this.currentIndex !== -1 && currentTime >= endTime) {
      this.removeLyrics(); // with animation
      this.currentIndex = -1;
    }

    // Find and show the correct lyric line
    const nextIndex = this.lyrics.findIndex((l, i) => {
      const next = this.lyrics[i + 1];
      const end = l.endTime ?? next?.startTime ?? Infinity;
      return currentTime >= l.startTime && currentTime < end;
    });

    if (nextIndex === -1 || nextIndex === this.currentIndex) return;

    this.currentIndex = nextIndex;
    this.animate(this.lyrics[nextIndex].text);
  }

  removeLyrics(): Promise<void> {
    if (!this.split) {
      this.container.textContent = "";
      this.container.classList.add("invisible");
      return Promise.resolve();
    }
    const chars = this.split.chars;

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        gsap.to(chars, {
          duration: 0.3,
          yPercent: "random([-100, 100])",
          xPercent: "random([-100, 100])",
          opacity: 0,
          ease: "power3.in",
          stagger: {
            from: "center",
            amount: 0.05,
          },
          onComplete: () => {
            this.split?.revert();
            this.split = undefined;
            this.container.textContent = "";
            this.container.classList.add("invisible");
            resolve();
          },
        });
      });
    });
  }

  animate(text: string) {
    this.#debounceAnimate(text);
  }

  #debounceAnimate = debounce((text: string) => {
    this.#animate_(text);
  }, 500);

  async #animate_(text: string) {
    await this.removeLyrics();

    this.container.textContent = text;
    await document.fonts.ready;

    requestAnimationFrame(() => {
      this.split = SplitText.create(this.container, {
        type: "chars,words,lines",
        autoSplit: true,
        // linesClass: "flex! flex-row-reverse!",
        // wordsClass: "w-22",
        // charsClass: "mix-blend-difference",
      });

      this.container.classList.remove("invisible");

      gsap.from(this.split.chars, {
        duration: 0.3,
        yPercent: "random([-100,100])",
        xPercent: "random([-100,100])",
        opacity: 0,
        ease: "power3.out",
        stagger: {
          from: "random",
          amount: 0.2,
        },
      });
    });
  }

  startSyncRafId: number = 0;
  startSync(getTime: () => number) {
    const loop = () => {
      const time = getTime();
      this.render(time);
      this.startSyncRafId = requestAnimationFrame(loop);
    };
    loop();
  }

  stopSync() {
    cancelAnimationFrame(this.startSyncRafId);
    this.startSyncRafId = 0;
  }
}
