import { useGeneralContext } from "#/context/GeneralContext";
import { useHoverBlink } from "#/hooks/blink";
import { cn } from "#/lib/utils";
import { createMemo, createSignal } from "solid-js";

export function Section1() {
  const { $general, $setGeneral } = useGeneralContext();
  const [textRef, setTextRef] = createSignal<HTMLParagraphElement>();

  useHoverBlink(
    createMemo(() => [textRef()]),
    { targetOpacity: 0.4 },
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
        <p ref={setTextRef} class="text-sm font-jetbrains-mono opacity-50 max-w-xs text-center">
          [01] Welcome to my little corner of the internet, where pixels dance and coffee turns into
          code.
        </p>
      </div>
    </div>
  );
}
