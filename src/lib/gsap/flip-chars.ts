export function flipChars({
  chars,
  flipDirection = "horizontal",
}: {
  chars: Element[];
  flipDirection?: "horizontal" | "vertical";
}) {
  let flipTween: gsap.core.Tween;

  const startFlip = () => {
    if (flipTween) flipTween.kill();
    gsap.set(chars, { transformStyle: "preserve-3d" });
    const rotationAxis = flipDirection === "vertical" ? "rotateX" : "rotateY";

    flipTween = gsap.to(chars, {
      [rotationAxis]: "+=180",
      duration: 1,
      ease: "expo.inOut",
      delay: gsap.utils.random(2, 5),
      onComplete: startFlip,
    });
  };

  startFlip();

  return {
    kill: () => {
      if (flipTween) flipTween.kill();
    },
  };
}
