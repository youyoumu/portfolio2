import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export default function gsapInit() {
  gsap.registerPlugin(Observer);
  gsap.registerPlugin(ScrollSmoother);
  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(SplitText);

  window.gsap = gsap;
  //@ts-expect-error
  window.Observer = Observer;
  //@ts-expect-error
  window.ScrollSmoother = ScrollSmoother;
  //@ts-expect-error
  window.ScrollTrigger = ScrollTrigger;
  //@ts-expect-error
  window.SplitText = SplitText;
}
