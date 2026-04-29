import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export default function gsapInit() {
  gsap.registerPlugin(Observer);
  gsap.registerPlugin(ScrollSmoother);
  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(SplitText);
  gsap.registerPlugin(ScrambleTextPlugin);
  gsap.registerPlugin(ScrollToPlugin);

  window.gsap = gsap;
  //@ts-expect-error
  window.Observer = Observer;
  //@ts-expect-error
  window.ScrollSmoother = ScrollSmoother;
  //@ts-expect-error
  window.ScrollTrigger = ScrollTrigger;
  //@ts-expect-error
  window.SplitText = SplitText;
  //@ts-expect-error
  window.ScrambleTextPlugin = ScrambleTextPlugin;
  //@ts-expect-error
  window.ScrollToPlugin = ScrollToPlugin;
}
