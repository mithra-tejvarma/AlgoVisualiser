"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/store/visualizerStore";

export function usePlaybackEngine() {
  const { isPlaying, speed, stepForward, isComplete, pause } = useVisualizerStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying && !isComplete) {
      timerRef.current = setInterval(() => {
        stepForward();
      }, speed);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, isComplete, stepForward]);

  useEffect(() => {
    if (isComplete && isPlaying) {
      pause();
    }
  }, [isComplete, isPlaying, pause]);
}
