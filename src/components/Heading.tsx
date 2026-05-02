import { cn } from "#/lib/utils";

export function Heading(props: {
  ref: (el: HTMLDivElement) => void;
  style: { transform: string };
  class: string;
  children: string;
}) {
  return (
    <div
      ref={props.ref}
      class={cn(
        "text-nowrap leading-[0.85] font-bebas-neue tracking-wide absolute text-[15svw] lg:text-[10svw] text-neutral-content opacity-50 pointer-events-none",
        props.class,
      )}
      style={props.style}
    >
      {props.children}
    </div>
  );
}
