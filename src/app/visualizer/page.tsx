"use client";

import { useEffect, useRef } from "react";
import { ControlPanel } from "@/components/visualizer/ControlPanel";
import { VisualizerCanvas } from "@/components/visualizer/VisualizerCanvas";
import { InfoPanel } from "@/components/visualizer/InfoPanel";
import { usePlaybackEngine } from "@/hooks/usePlaybackEngine";
import { useVisualizerStore } from "@/store/visualizerStore";
import { useAuth } from "@/context/AuthContext";
import { trackAlgorithmVisit } from "@/lib/tracking";

export default function VisualizerPage() {
  usePlaybackEngine();
  const { steps, currentStep, algorithm } = useVisualizerStore();
  const { user } = useAuth();
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  const trackedAlgo = useRef<string | null>(null);

  // Track algorithm visit when algorithm changes
  useEffect(() => {
    if (user && algorithm && algorithm !== trackedAlgo.current) {
      trackedAlgo.current = algorithm;
      trackAlgorithmVisit(user.uid, algorithm, "visualizer").catch(console.error);
    }
  }, [user, algorithm]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Progress bar */}
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 3-column workspace */}
        <div className="grid gap-4 lg:grid-cols-[280px_1fr_300px] lg:grid-rows-[minmax(500px,70vh)]">
          {/* Left — Controls */}
          <div className="order-2 lg:order-1">
            <ControlPanel />
          </div>

          {/* Center — Canvas */}
          <div className="order-1 lg:order-2 min-h-[350px]">
            <VisualizerCanvas />
          </div>

          {/* Right — Info */}
          <div className="order-3">
            <InfoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
