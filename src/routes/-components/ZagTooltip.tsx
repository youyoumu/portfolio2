import { normalizeProps, useMachine } from "@zag-js/solid";
import * as tooltip from "@zag-js/tooltip";
import { createMemo, createUniqueId, type JSX, Show } from "solid-js";

import { cn } from "#/lib/utils/cn";

export function ZagTooltip(props: {
  trigger: JSX.Element;
  tooltop: JSX.Element;
  classNames?: {
    root?: string;
  };
}) {
  //@ts-expect-error idk, i follow docs
  const service = useMachine(tooltip.machine, {
    id: createUniqueId(),
    openDelay: 0,
    closeDelay: 0,
    positioning: {
      placement: "top-center",
      offset: {
        mainAxis: 0,
      },
    },
  });
  //@ts-expect-error idk, i follow docs
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
