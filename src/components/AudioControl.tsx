import { useIsMobile } from "#/hooks";
import { cn } from "#/lib/utils";
import {
  IconExternalLink,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconVolume,
  IconVolume3,
} from "@tabler/icons-solidjs";
import { createSignal, Show } from "solid-js";

import { ScrollingText } from "./ScrollingText";
import { ZagSlider } from "./ZagSlider";

const MAX_VOLUME = 0.3;

export function AudioControl(props: {
  timeElapsed: string;
  maxDuration: string;
  progress: number;
  playing: boolean;
  volume: number;
  visualizerCanvas: HTMLCanvasElement | undefined;
  onProgressChange: (progress: number) => void;
  onVolumeChange: (percentage: number) => void;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  music?: {
    artist: string;
    title: string;
    link: string;
  };
}) {
  const [previousPercentage, setPreviousPercentage] = createSignal(0);
  const percentage = () => (props.volume / MAX_VOLUME) * 100;
  const isMobile = useIsMobile();

  const ProgressBar = () => (
    <div class="flex items-center gap-4">
      <div class="text-neutral-content font-bitcount-single font-light text-sm">
        {props.timeElapsed}
      </div>
      <ZagSlider
        classNames={{
          root: "w-44 sm:w-64",
          control: "h-1 sm:h-2",
          range: "h-1 sm:h-2",
          thumb: "size-2.5 -translate-y-[3px] sm:size-4 sm:-translate-y-1",
        }}
        value={props.progress}
        onValueChange={props.onProgressChange}
        debounceDuration={250}
      />

      <div class="text-neutral-content font-bitcount-single font-light text-sm">
        {props.maxDuration}
      </div>
    </div>
  );

  return (
    <div class="fixed bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 px-2  w-full sm:w-[600px]">
      <div class="bg-neutral py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-full flex flex-col gap-2 items-center">
        <div class="flex gap-1 sm:gap-4 items-center w-full justify-between flex-col sm:flex-row">
          <div class="flex gap-4 items-center">
            <div class="w-64 sm:w-40">
              <ScrollingText
                trenshold={14}
                text={props.music?.artist ?? "a"}
                classNames={{
                  container: "leading-none",
                  text: cn("me-16 font-bitcount-single leading-none text-neutral-content", {
                    invisible: !props.music?.artist?.length,
                  }),
                }}
              />
              <ScrollingText
                trenshold={21}
                text={props.music?.title ?? "a"}
                classNames={{
                  container: "leading-none",
                  text: cn(
                    "text-base-300/50 text-xs me-16 font-bitcount-single font-light leading-none",
                    {
                      invisible: !props.music?.title?.length,
                    },
                  ),
                }}
              />
            </div>

            <a href={props.music?.link} target="_blank">
              <IconExternalLink class="text-neutral-content cursor-pointer size-5" />
            </a>
          </div>
          <Show when={isMobile()}>
            <ProgressBar />
          </Show>

          <div class="flex gap-4 items-center justify-between">
            <IconPlayerSkipBackFilled
              onClick={props.onSkipBack}
              class="text-neutral-content cursor-pointer size-5"
            />
            <div
              class="rounded-full bg-neutral-content text-neutral cursor-pointer p-1 flex flex-col items-center justify-center"
              onClick={props.onPlayPause}
            >
              {props.playing ? (
                <IconPlayerPauseFilled class="size-8 sm:size-6" />
              ) : (
                <IconPlayerPlayFilled class="size-8 sm:size-6" />
              )}
            </div>
            <IconPlayerSkipForwardFilled
              onClick={props.onSkipForward}
              class="text-neutral-content cursor-pointer size-5"
            />
          </div>

          <div class="sm:flex items-center gap-4 hidden">
            {props.visualizerCanvas}
            <div class="flex items-center gap-4">
              {percentage() === 0 ? (
                <IconVolume3
                  onClick={() => {
                    props.onVolumeChange(previousPercentage());
                  }}
                  class="text-neutral-content cursor-pointer size-5"
                />
              ) : (
                <IconVolume
                  onClick={() => {
                    setPreviousPercentage(percentage());
                    props.onVolumeChange(0);
                  }}
                  class="text-neutral-content cursor-pointer size-5"
                />
              )}
              <ZagSlider
                value={percentage()}
                debounceDuration={50}
                onValueChange={props.onVolumeChange}
                classNames={{
                  root: "w-20",
                  thumb: "bg-secondary",
                  range: "bg-secondary",
                }}
              />
            </div>
          </div>
        </div>

        <Show when={!isMobile()}>
          <ProgressBar />
        </Show>
      </div>
    </div>
  );
}
