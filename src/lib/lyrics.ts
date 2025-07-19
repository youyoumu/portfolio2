import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

type LyricLine = {
  text: string;
  startTime: number;
  endTime?: number;
};

const offset = 1;
const lyrics = [
  { text: "流れてく 時の中ででも", startTime: 29 },
  { text: "気だるさが ほらグルグル廻って", startTime: 33.013 },
  { text: "私から 離れる心も", startTime: 36.415 },
  { text: "見えないわ そう知らない?", startTime: 39.952 },
  { text: "自分から 動くこともなく", startTime: 43.172 },
  { text: "時の隙間に 流され続けて", startTime: 46.891 },
  { text: "知らないわ 周りのことなど", startTime: 50.337 },
  { text: "私は私 それだけ", startTime: 53.83 },

  { text: "夢見てる? 何も見てない?", startTime: 57.095 },
  { text: "語るも無駄な 自分の言葉?", startTime: 60.133 },
  { text: "悲しむなんて 疲れるだけよ", startTime: 63.58 },
  { text: "何も感じず 過ごせばいいの", startTime: 67.118 },
  { text: "戸惑う言葉 与えられても", startTime: 70.61 },
  { text: "自分の心 ただ上の空", startTime: 74.056 },
  { text: "もし私から 動くのならば", startTime: 77.548 },
  { text: "全変えるのなら 黒にする", startTime: 81.04 },

  { text: "こんな自分に 未来はあるの?", startTime: 84.532 },
  { text: "こんな世界に 私はいるの?", startTime: 88.025 },
  { text: "今切ないの? 今悲しいの?", startTime: 91.471 },
  { text: "自分のことも わからないまま", startTime: 94.963 },
  { text: "歩むことさえ 疲れるだけよ", startTime: 98.41 },
  { text: "人のことなど 知りもしないわ", startTime: 101.902 },
  { text: "こんな私も 変われるのなら", startTime: 105.44 },
  { text: "もし変われるの なら白になる", startTime: 108.886, endTime: 112.378 },

  { text: "流れてく 時の中ででも", startTime: 126.891 },
  { text: "気だるさが ほらグルグル廻って", startTime: 130.428 },
  { text: "私から 離れる心も", startTime: 133.83 },
  { text: "見えないわ そう知らない?", startTime: 137.367 },
  { text: "自分から 動くこともなく", startTime: 140.632 },
  { text: "時の隙間に 流され続けて", startTime: 144.26 },
  { text: "知らないわ 周りのことなど", startTime: 147.7 },
  { text: "私は私 それだけ", startTime: 151.244 },

  { text: "夢見てる? 何も見てない?", startTime: 154.555 },
  { text: "語るも無駄な 自分の言葉?", startTime: 157.594 },
  { text: "悲しむなんて 疲れるだけよ", startTime: 161.04 },
  { text: "何も感じず 過ごせばいいの", startTime: 164.487 },
  { text: "戸惑う言葉 与えられても", startTime: 167.979 },
  { text: "自分の心 ただ上の空", startTime: 171.426 },
  { text: "もし私から 動くのならば", startTime: 174.918 },
  { text: "すべて変えるのなら 黒にする", startTime: 178.455 },

  { text: "動くのならば 動くのならば", startTime: 181.947 },
  { text: "全て壊すわ 全て壊すわ", startTime: 185.44 },
  { text: "悲しむならば 悲しむならば", startTime: 188.932 },
  { text: "私の心 白く束ねる", startTime: 192.333 },

  { text: "貴方の事も 私の事も", startTime: 195.825 },
  { text: "全ての事も まだ知らないの", startTime: 199.317 },
  { text: "重い目蓋を 開けたのならば", startTime: 202.809 },
  { text: "全壊すのなら 黒になれ", startTime: 206.256 },
];

export class Lyrics {
  container: HTMLElement = document.createElement("div");
  lyrics: LyricLine[] = lyrics.map((value) => ({
    ...value,
    startTime: value.startTime + offset,
  }));
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
        type: "chars,words,lines",
        linesClass: "flex! flex-row-reverse!",
        wordsClass: "w-16 text-6xl",
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
