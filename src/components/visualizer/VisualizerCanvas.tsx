"use client";

import { useVisualizerStore } from "@/store/visualizerStore";
import { motion } from "framer-motion";
import type { BarState } from "@/lib/algorithms";

const barColors: Record<BarState, string> = {
  default: "from-cyan-400 to-blue-500",
  comparing: "from-violet-500 to-pink-500",
  swapping: "from-pink-500 to-rose-500",
  sorted: "from-emerald-400 to-teal-500",
  pivot: "from-amber-400 to-orange-500",
  selected: "from-indigo-500 to-violet-500",
};

const barShadows: Record<BarState, string> = {
  default: "shadow-cyan-500/20",
  comparing: "shadow-violet-500/30",
  swapping: "shadow-pink-500/30",
  sorted: "shadow-emerald-500/20",
  pivot: "shadow-amber-500/20",
  selected: "shadow-indigo-500/20",
};

export function VisualizerCanvas() {
  const { steps, currentStep } = useVisualizerStore();
  const current = steps[currentStep];
  if (!current) return null;

  // Only display if it's an array visualization
  if (current.snapshot.kind !== "array") return null;

  const bars = current.snapshot.bars;
  const maxVal = Math.max(...bars.map((b) => b.value));
  const barCount = bars.length;

  return (
    <div className="glass-card flex h-full flex-col overflow-hidden p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Visualization
        </h2>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
          Step {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Bars */}
      <div className="flex flex-1 items-end justify-center gap-[2px] px-2">
        {bars.map((bar, i) => {
          const heightPct = (bar.value / maxVal) * 100;
          const grad = barColors[bar.state];
          const shadow = barShadows[bar.state];

          return (
            <motion.div
              key={i}
              className={`relative bg-gradient-to-t ${grad} shadow-lg ${shadow}`}
              style={{
                width: `${Math.max(100 / barCount - 1, 2)}%`,
                borderRadius: "4px 4px 0 0",
              }}
              initial={false}
              animate={{ height: `${heightPct}%` }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {barCount <= 25 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-400">
                  {bar.value}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Step label */}
      <div className="mt-4 rounded-xl bg-white/5 px-4 py-2.5 text-center text-sm font-medium text-slate-300">
        {current.label}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {(["default", "comparing", "swapping", "sorted"] as BarState[]).map((state) => (
          <div key={state} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${barColors[state]}`} />
            <span className="text-[10px] font-medium capitalize text-slate-500">{state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
