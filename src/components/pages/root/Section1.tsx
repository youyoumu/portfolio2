import { useGeneralContext } from "#/context/GeneralContext";
import { useHoverBlink } from "#/hooks/blink";
import { useSlide } from "#/hooks/slide";
import { cn } from "#/lib/utils";
import { createMemo, createSignal } from "solid-js";

export function Section1() {
  const { $general, $setGeneral } = useGeneralContext();
  const [sentenceRef, setSentenceRef] = createSignal<HTMLParagraphElement>();

  useHoverBlink(createMemo(() => [sentenceRef()]));

  useSlide(
    createMemo(() => sentenceRef()),
    { targetOpacity: 0.5, start: "top 85%", end: "top 5%" },
  );

  return (
    <div
      ref={(el) => $setGeneral("section1", el)}
      class="h-lvh w-full flex items-center justify-center p-8"
    >
      <div
        class={cn("transition-opacity duration-1000", {
          "opacity-0 pointer-events-none": $general.musicPlayed,
        })}
      >
        <p ref={setSentenceRef} class="text-sm font-jetbrains-mono max-w-xs text-center">
          [01] Welcome to my little corner of the internet, where pixels dance and coffee turns into
          code.
        </p>
      </div>
    </div>
  );
}
