import { createSeededRandom } from "../random";

export function flipChars({
  chars,
  flipDirection = "horizontal",
  seed,
}: {
  chars: Element[];
  flipDirection?: "horizontal" | "vertical";
  seed?: string | number;
}) {
  let flipTween: gsap.core.Tween;
  const random = createSeededRandom(seed ?? Math.random());

  const startFlip = () => {
    if (flipTween) flipTween.kill();

    gsap.set(chars, { transformStyle: "preserve-3d" });

    const rotationAxis = flipDirection === "vertical" ? "rotateX" : "rotateY";

    const flipCount = random.int(1, 4);
    const rotationAmount = flipCount * 180;

    flipTween = gsap.to(chars, {
      [rotationAxis]: `+=${rotationAmount}`,
      duration: flipCount * 0.6, // Scale duration based on number of flips
      /*
         'back.out(1.7)' provides the inertia/overshoot effect. 
         Higher numbers = more "bounce" at the end. 
      */
      ease: "back.out(1.5)",
      delay: random.float(2, 5),
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
