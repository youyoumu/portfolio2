import { createMemo, For } from "solid-js";

export type TransformValues = {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  skewX: number;
  skewY: number;
};

export function MarkerDebug(props: {
  values: TransformValues;
  onChange: (values: TransformValues) => void;
  onClose: () => void;
}) {
  const fields: (keyof TransformValues)[] = ["rotateX", "rotateY", "rotateZ", "skewX", "skewY"];

  const transformString = createMemo(() => {
    const { rotateX, rotateY, rotateZ, skewX, skewY } = props.values;
    let str = "";
    if (rotateX !== 0) str += `rotateX(${rotateX}deg) `;
    if (rotateY !== 0) str += `rotateY(${rotateY}deg) `;
    if (rotateZ !== 0) str += `rotateZ(${rotateZ}deg) `;
    if (skewX !== 0) str += `skewX(${skewX}deg) `;
    if (skewY !== 0) str += `skewY(${skewY}deg) `;
    return str.trim();
  });

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(transformString());
  };

  return (
    <div class="fixed bottom-4 right-4 z-[100] bg-neutral p-4 rounded-lg shadow-2xl border border-primary/20 w-80 flex flex-col gap-4 text-neutral-content">
      <div class="flex justify-between items-center">
        <h3 class="font-bold">Marker Debug</h3>
        <button class="btn btn-ghost btn-xs" onClick={props.onClose}>
          ✕
        </button>
      </div>

      <div class="flex flex-col gap-3">
        <For each={fields}>
          {(field) => (
            <div class="flex flex-col gap-1">
              <div class="flex justify-between text-xs">
                <label>{field}</label>
                <span>{props.values[field]}deg</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={props.values[field]}
                onInput={(e) => {
                  props.onChange({
                    ...props.values,
                    [field]: parseInt(e.currentTarget.value),
                  });
                }}
                class="range range-primary range-xs"
              />
            </div>
          )}
        </For>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs">Result:</label>
        <div
          class="bg-black/40 p-2 rounded text-xs font-mono break-all cursor-pointer hover:bg-black/60 transition-colors"
          onClick={copyToClipboard}
        >
          {transformString() || "none"}
        </div>
        <button class="btn btn-primary btn-sm" onClick={copyToClipboard}>
          Copy Transform
        </button>
      </div>
    </div>
  );
}
