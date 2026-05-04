import { useGeneralContext } from "#/context/GeneralContext";
import { cn } from "#/lib/utils";

export function Section1() {
  const { $general, $setGeneral } = useGeneralContext();

  return (
    <div
      ref={(el) => $setGeneral("section1", el)}
      class="h-lvh w-full flex items-center justify-center p-8"
    >
      <p
        class={cn(
          "text-sm font-jetbrains-mono opacity-50 max-w-xs text-center transition-opacity duration-1000",
          {
            "opacity-0 pointer-events-none": $general.musicPlayed,
          },
        )}
      >
        [01] Welcome to my little corner of the internet, where pixels dance and coffee turns into
        code.
      </p>
    </div>
  );
}
