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

function createSeededRandom(seed: string | number) {
  const initialSeed =
    typeof seed === "number" ? seed : hashString(seed);
  let state = initialSeed || 1;

  const next = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return {
    float(min: number, max: number) {
      return min + next() * (max - min);
    },
    int(min: number, max: number) {
      return Math.floor(min + next() * (max - min + 1));
    },
  };
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
