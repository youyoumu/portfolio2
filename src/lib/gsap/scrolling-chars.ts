export function scrollingChars({
  heading1,
  heading2,
  flipIndex,
  flipDirection = "horizontal",
}: {
  heading1: HTMLElement;
  heading2: HTMLElement;
  flipIndex?: number;
  flipDirection?: "horizontal" | "vertical";
}) {
  let tween1: gsap.core.Tween;
  let tween2: gsap.core.Tween;

  const charsToFlip: Element[] = [];
  let flipTween: gsap.core.Tween;

  const startFlip = (chars: Element[]) => {
    if (flipTween) flipTween.kill();
    gsap.set(chars, { transformStyle: "preserve-3d" });
    const rotationAxis = flipDirection === "vertical" ? "rotateX" : "rotateY";
    flipTween = gsap.to(chars, {
      [rotationAxis]: "+=180",
      duration: 1,
      ease: "expo.inOut",
      delay: gsap.utils.random(2, 5),
      onComplete: () => startFlip(chars),
    });
  };

  SplitText.create(heading1, {
    type: "chars,words,lines",
    autoSplit: true,
    mask: "lines",
    onSplit: (self) => {
      tween1 = gsap.fromTo(
        self.chars,
        {
          yPercent: 0,
        },
        {
          duration: 1,
          yPercent: -100,
          stagger: 0.03,
          ease: "expo.inOut",
          paused: true,
        },
      );

      if (flipIndex !== undefined && self.chars[flipIndex]) {
        charsToFlip[0] = self.chars[flipIndex];
        if (charsToFlip[0] && charsToFlip[1]) {
          startFlip(charsToFlip);
        }
      }
    },
  });

  SplitText.create(heading2, {
    type: "chars,words,lines",
    autoSplit: true,
    mask: "lines",
    onSplit: (self) => {
      tween2 = gsap.fromTo(
        self.chars,
        {
          yPercent: 100,
        },
        {
          duration: 1,
          yPercent: 0,
          stagger: 0.03,
          ease: "expo.inOut",
          paused: true,
        },
      );

      if (flipIndex !== undefined && self.chars[flipIndex]) {
        charsToFlip[1] = self.chars[flipIndex];
        if (charsToFlip[0] && charsToFlip[1]) {
          startFlip(charsToFlip);
        }
      }
    },
  });

  function tweenRestart() {
    tween1.restart();
    tween2.restart();
  }

  return { tweenRestart };
}
