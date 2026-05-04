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

    const flipCount = gsap.utils.random([1, 2, 3, 4]);
    const rotationAmount = flipCount * 180;

    flipTween = gsap.to(chars, {
      [rotationAxis]: `+=${rotationAmount}`,
      duration: flipCount * 0.6, // Scale duration based on number of flips
      /*
         'back.out(1.7)' provides the inertia/overshoot effect. 
         Higher numbers = more "bounce" at the end. 
      */
      ease: "back.out(1.5)",
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
