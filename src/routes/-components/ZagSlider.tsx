import { debounce } from "@solid-primitives/scheduled";
import * as slider from "@zag-js/slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
} from "solid-js";

import { cn } from "#/lib/utils/cn";

export function ZagSlider(props: {
  value?: number;
  debounceDuration?: number;
  onValueChange?: (number: number) => void;
  label?: string;
  classNames?: {
    root?: string;
    control?: string;
    range?: string;
    thumb?: string;
  };
}) {
  const [value, setValue] = createSignal([0]);

  let lockSetValue = false;
  let immediate = true;
  const onChangeDebounce = (() => {
    const debounced = debounce((newValue: number) => {
      props.onValueChange?.(newValue);
      immediate = true;
      lockSetValue = false;
    }, props.debounceDuration ?? 0);
    return (newValue: number) => {
      if (immediate) {
        props.onValueChange?.(newValue); // immediate on first call
        immediate = false;
        lockSetValue = false;
      } else {
        debounced(newValue); // debounce after
      }
    };
  })();

  const service = useMachine(slider.machine, {
    id: createUniqueId(),
    defaultValue: [100],
    thumbAlignment: "center",
    get value() {
      return value();
    },
    onValueChange(details) {
      setValue(details.value);
      lockSetValue = true;
      onChangeDebounce(details.value[0]);
    },
  });
  const api = createMemo(() => slider.connect(service, normalizeProps));

  createEffect(() => {
    const value = props.value;
    if (lockSetValue) {
      return;
    }
    setValue([value ?? 0]);
  });

  return (
    <div {...api().getRootProps()} class={cn("w-64", props.classNames?.root)}>
      <div class="hidden">
        <label {...api().getLabelProps()}>{props.label}</label>
        <output {...api().getValueTextProps()}>{api().value.at(0)}</output>
      </div>
      <div
        class={cn(
          "h-2 bg-neutral-content rounded-full cursor-pointer",
          props.classNames?.control,
        )}
        {...api().getControlProps()}
      >
        <div {...api().getTrackProps()}>
          <div
            class={cn("h-2 rounded-full bg-primary", props.classNames?.range)}
            {...api().getRangeProps()}
          />
        </div>
        <For each={api().value}>
          {(_, index) => (
            <div
              class={cn(
                "size-4 -translate-y-1 bg-primary rounded-full focus:outline-0",
                props.classNames?.thumb,
              )}
              {...api().getThumbProps({ index: index() })}
            >
              <input {...api().getHiddenInputProps({ index: index() })} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
