import { cn } from "#/lib/utils/cn";
import { normalizeProps, useMachine } from "@zag-js/solid";
import * as tooltip from "@zag-js/tooltip";
import { createMemo, createUniqueId, type JSX, Show } from "solid-js";

export function ZagTooltip(props: {
  trigger: JSX.Element;
  tooltop: JSX.Element;
  classNames?: {
    root?: string;
  };
}) {
  const service = useMachine(tooltip.machine, {
    id: createUniqueId(),
    openDelay: 0,
    closeDelay: 0,
    positioning: {
      placement: "top",
      offset: {
        mainAxis: 0,
      },
    },
  });
  const api = createMemo(() => tooltip.connect(service, normalizeProps));

  return (
    <div class={cn("contents", props.classNames?.root)}>
      <button {...api().getTriggerProps()}>{props.trigger}</button>
      <Show when={api().open}>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>{props.tooltop}</div>
        </div>
      </Show>
    </div>
  );
}
