import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export function init() {
  gsap.registerPlugin(
    Observer,
    ScrollSmoother,
    ScrollTrigger,
    SplitText,
    ScrambleTextPlugin,
    ScrollToPlugin,
  );

  Object.assign(globalThis, {
    gsap,
    Observer,
    ScrollSmoother,
    ScrollTrigger,
    SplitText,
    ScrambleTextPlugin,
    ScrollToPlugin,
  });
}
