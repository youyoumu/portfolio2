export function scrollingChars({
  heading1,
  heading2,
}: {
  heading1: HTMLElement;
  heading2: HTMLElement;
}) {
  let tween1: gsap.core.Tween;
  let tween2: gsap.core.Tween;
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
    },
  });

  function tweenRestart() {
    tween1.restart();
    tween2.restart();
  }

  return { tweenRestart };
}
