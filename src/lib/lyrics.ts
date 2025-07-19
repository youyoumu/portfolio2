import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

type LyricLine = {
  text: string;
  startTime: number;
  endTime?: number;
};

const lyrics = [
  { text: "Once upon a time...", startTime: 0 },
  { text: "In a world of darkness", startTime: 3.5 },
  { text: "A spark ignites.", startTime: 7.2 },
];

export class Lyrics {
  container: HTMLElement = document.createElement("div");
  lyrics: LyricLine[] = lyrics;
  currentIndex = -1;
  split?: SplitText;

  constructor() {}

  render(currentTime: number) {
    const nextIndex = this.lyrics.findIndex((l, i) => {
      const next = this.lyrics[i + 1];
      const end = l.endTime ?? next?.startTime ?? Infinity;
      return currentTime >= l.startTime && currentTime < end;
    });

    if (nextIndex === -1 || nextIndex === this.currentIndex) return;

    this.currentIndex = nextIndex;
    const line = this.lyrics[nextIndex];
    this.animate(line.text);
  }

  animate(text: string) {
    if (this.split) {
      this.split.revert();
      this.split = undefined;
    }
    this.container.textContent = text;

    // wait for DOM paint before splitting
    requestAnimationFrame(() => {
      this.split = SplitText.create(this.container, {
        type: "chars,words",
        mask: "chars",
      });

      gsap.from(this.split.chars, {
        duration: 0.6,
        yPercent: "random([-150,150])",
        xPercent: "random([-150,150])",
        opacity: 0,
        ease: "power3.out",
        stagger: {
          from: "random",
          amount: 0.6,
        },
      });
    });
  }

  startSync(getTime: () => number) {
    const loop = () => {
      const time = getTime();
      this.render(time);
      requestAnimationFrame(loop);
    };
    loop();
  }
}
