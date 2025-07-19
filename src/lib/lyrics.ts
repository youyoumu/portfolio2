import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

type LyricLine = {
  text: string;
  startTime: number;
  endTime?: number;
};

const lyrics = [
  { text: "流れてく 時の中ででも", startTime: 29.2 },
  { text: "気だるさが ほらグルグル廻って", startTime: 33 },
  { text: "私から 離れる心も", startTime: 36 },
  { text: "見えないわ そう知らない?", startTime: 40 },
  { text: "自分から 動くこともなく", startTime: 43 },
  { text: "時の隙間に 流され続けて", startTime: 47 },
  { text: "知らないわ 周りのことなど", startTime: 50 },
  { text: "私は私 それだけ", startTime: 54 },

  { text: "夢見てる? 何も見てない?", startTime: 57 },
  { text: "語るも無駄な 自分の言葉?", startTime: 60 },
  { text: "悲しむなんて 疲れるだけよ", startTime: 64 },
  { text: "何も感じず 過ごせばいいの", startTime: 67 },
  { text: "戸惑う言葉 与えられても", startTime: 71 },
  { text: "自分の心 ただ上の空", startTime: 74 },
  { text: "もし私から 動くのならば", startTime: 77 },
  { text: "すべて変えるのなら 黒にする", startTime: 81 },

  { text: "こんな自分に未来はあるの?", startTime: 84 },
  { text: "こんな世界に私はいるの?", startTime: 88 },
  { text: "今切ないの? 今悲しいの?", startTime: 91 },
  { text: "自分のこともわからないまま", startTime: 95 },
  { text: "歩むことさえ疲れるだけよ", startTime: 98 },
  { text: "人のことなど知りもしないわ", startTime: 102 },
  { text: "こんな私も変われるのなら", startTime: 105.3 },
  { text: "もし変われるのなら白になる", startTime: 109 },

  { text: "流れてく 時の中ででも", startTime: 126.5 },
  { text: "気だるさが ほらグルグル廻って", startTime: 130 },
  { text: "私から 離れる心も", startTime: 133 },
  { text: "見えないわ そう知らない?", startTime: 137 },
  { text: "自分から 動くこともなく", startTime: 140 },
  { text: "時の隙間に 流され続けて", startTime: 144 },
  { text: "知らないわ 周りのことなど", startTime: 147 },
  { text: "私は私 それだけ", startTime: 151 },

  { text: "夢見てる? 何も見てない?", startTime: 154 },
  { text: "語るも無駄な 自分の言葉?", startTime: 157 },
  { text: "悲しむなんて 疲れるだけよ", startTime: 161 },
  { text: "何も感じず 過ごせばいいの", startTime: 164 },
  { text: "戸惑う言葉 与えられても", startTime: 168 },
  { text: "自分の心 ただ上の空", startTime: 171 },
  { text: "もし私から 動くのならば", startTime: 175 },
  { text: "すべて変えるのなら 黒にする", startTime: 178 },

  { text: "動くのならば 動くのならば", startTime: 182 },
  { text: "全て壊すの 全て壊すの", startTime: 185 },
  { text: "悲しむならば 悲しむならば", startTime: 189 },
  { text: "私の心白く束ねる", startTime: 192 },

  { text: "あなたのことも私のことも", startTime: 195 },
  { text: "全てことをまだ知らないの", startTime: 199 },
  { text: "重い瞼を開けたのならば", startTime: 203 },
  { text: "すべて壊すのなら 黒になれ", startTime: 206 },
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
