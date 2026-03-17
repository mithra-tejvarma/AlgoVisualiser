"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackAlgorithmVisit } from "@/lib/tracking";
import { motion } from "framer-motion";
import {
  compareAlgorithmKeys,
  type AlgorithmKey,
  type AlgorithmStep,
  type BarState,
  algorithmInfoMap,
  generateSteps,
  generateRandomArray,
} from "@/lib/algorithms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  GitCompareArrows,
  Clock,
  ArrowRightLeft,
  Footprints,
} from "lucide-react";

const STORAGE_KEY = "compare.selection";

function toAlgorithmKey(value: string): value is AlgorithmKey {
  return value in algorithmInfoMap;
}

const barColors: Record<BarState, string> = {
  default: "from-cyan-400 to-blue-500",
  comparing: "from-violet-500 to-pink-500",
  swapping: "from-pink-500 to-rose-500",
  sorted: "from-emerald-400 to-teal-500",
  pivot: "from-amber-400 to-orange-500",
  selected: "from-indigo-500 to-violet-500",
};

interface CompareInstance {
  algorithm: AlgorithmKey;
  steps: AlgorithmStep[];
  currentStep: number;
  isComplete: boolean;
  comparisons: number;
  swaps: number;
  startTime: number;
  elapsedMs: number;
}

function countOps(steps: AlgorithmStep[], upTo: number) {
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i <= upTo && i < steps.length; i++) {
    if (steps[i].comparing && steps[i].comparing!.length > 0) comparisons++;
    if (steps[i].swapping && steps[i].swapping!.length > 0) swaps++;
  }
  return { comparisons, swaps };
}

export default function ComparePage() {
  const [algoA, setAlgoA] = useState<AlgorithmKey>("bubble");
  const [algoB, setAlgoB] = useState<AlgorithmKey>("selection");
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(100);
  const [sharedArray, setSharedArray] = useState<number[]>(() => generateRandomArray(20));
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const trackedA = useRef<string | null>(null);
  const trackedB = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryA = params.get("algoA");
    const queryB = params.get("algoB");
    const localSelectionRaw = window.localStorage.getItem(STORAGE_KEY);
    let localSelection: AlgorithmKey[] = [];
    if (localSelectionRaw) {
      try {
        localSelection = (JSON.parse(localSelectionRaw) as string[]).filter(toAlgorithmKey);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    const preferredA = queryA && toAlgorithmKey(queryA) ? queryA : localSelection[0] ?? "bubble";
    let preferredB = queryB && toAlgorithmKey(queryB) ? queryB : localSelection[1] ?? "selection";
    if (preferredA === preferredB) {
      preferredB = compareAlgorithmKeys.find((key) => key !== preferredA) ?? "selection";
    }

    setAlgoA(preferredA);
    setAlgoB(preferredB);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([algoA, algoB]));
  }, [algoA, algoB]);

  // Track algorithm visits
  useEffect(() => {
    if (user && algoA && algoA !== trackedA.current) {
      trackedA.current = algoA;
      trackAlgorithmVisit(user.uid, algoA, "compare").catch(console.error);
    }
  }, [user, algoA]);

  useEffect(() => {
    if (user && algoB && algoB !== trackedB.current) {
      trackedB.current = algoB;
      trackAlgorithmVisit(user.uid, algoB, "compare").catch(console.error);
    }
  }, [user, algoB]);

  const [instanceA, setInstanceA] = useState<CompareInstance>(() => {
    const steps = generateSteps("bubble", { kind: "array", values: [...sharedArray] });
    return { algorithm: "bubble", steps, currentStep: 0, isComplete: false, comparisons: 0, swaps: 0, startTime: 0, elapsedMs: 0 };
  });
  const [instanceB, setInstanceB] = useState<CompareInstance>(() => {
    const steps = generateSteps("selection", { kind: "array", values: [...sharedArray] });
    return { algorithm: "selection", steps, currentStep: 0, isComplete: false, comparisons: 0, swaps: 0, startTime: 0, elapsedMs: 0 };
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInstances = useCallback((arr: number[], a: AlgorithmKey, b: AlgorithmKey) => {
    const stepsA = generateSteps(a, { kind: "array", values: [...arr] });
    const stepsB = generateSteps(b, { kind: "array", values: [...arr] });
    setInstanceA({ algorithm: a, steps: stepsA, currentStep: 0, isComplete: false, comparisons: 0, swaps: 0, startTime: 0, elapsedMs: 0 });
    setInstanceB({ algorithm: b, steps: stepsB, currentStep: 0, isComplete: false, comparisons: 0, swaps: 0, startTime: 0, elapsedMs: 0 });
    setIsPlaying(false);
  }, []);

  const handleRandomize = () => {
    const arr = generateRandomArray(arraySize);
    setSharedArray(arr);
    resetInstances(arr, algoA, algoB);
  };

  const handleReset = () => {
    resetInstances(sharedArray, algoA, algoB);
  };

  useEffect(() => {
    resetInstances(sharedArray, algoA, algoB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algoA, algoB]);

  useEffect(() => {
    const arr = generateRandomArray(arraySize);
    setSharedArray(arr);
    resetInstances(arr, algoA, algoB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arraySize]);

  useEffect(() => {
    if (isPlaying) {
      const now = Date.now();
      if (instanceA.startTime === 0) setInstanceA((p) => ({ ...p, startTime: now }));
      if (instanceB.startTime === 0) setInstanceB((p) => ({ ...p, startTime: now }));

      timerRef.current = setInterval(() => {
        setInstanceA((prev) => {
          if (prev.isComplete) return prev;
          const next = prev.currentStep + 1;
          if (next >= prev.steps.length) {
            return { ...prev, isComplete: true, elapsedMs: Date.now() - prev.startTime, ...countOps(prev.steps, next - 1) };
          }
          return {
            ...prev,
            currentStep: next,
            elapsedMs: prev.startTime > 0 ? Date.now() - prev.startTime : prev.elapsedMs,
            ...countOps(prev.steps, next),
          };
        });
        setInstanceB((prev) => {
          if (prev.isComplete) return prev;
          const next = prev.currentStep + 1;
          if (next >= prev.steps.length) {
            return { ...prev, isComplete: true, elapsedMs: Date.now() - prev.startTime, ...countOps(prev.steps, next - 1) };
          }
          return {
            ...prev,
            currentStep: next,
            elapsedMs: prev.startTime > 0 ? Date.now() - prev.startTime : prev.elapsedMs,
            ...countOps(prev.steps, next),
          };
        });
      }, speed);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, instanceA.startTime, instanceB.startTime]);

  useEffect(() => {
    if (instanceA.isComplete && instanceB.isComplete && isPlaying) {
      setIsPlaying(false);
    }
  }, [instanceA.isComplete, instanceB.isComplete, isPlaying]);

  const bothComplete = instanceA.isComplete && instanceB.isComplete;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/20">
              <GitCompareArrows className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Compare Mode</h1>
              <p className="text-xs text-slate-400">Side-by-side algorithm comparison</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-36">
              <Slider value={[speed]} onValueChange={(v) => setSpeed(Array.isArray(v) ? v[0] : v)} min={10} max={500} step={10} />
              <span className="mt-1 block text-center text-[10px] text-slate-500">{speed}ms / step</span>
            </div>
            <div className="w-36">
              <Slider value={[arraySize]} onValueChange={(v) => setArraySize(Array.isArray(v) ? v[0] : v)} min={5} max={50} step={1} disabled={isPlaying} />
              <span className="mt-1 block text-center text-[10px] text-slate-500">Size: {arraySize}</span>
            </div>
            <Button onClick={isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)} disabled={bothComplete} className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25">
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button onClick={handleReset} variant="ghost" className="rounded-xl border border-white/10 text-white">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleRandomize} variant="ghost" disabled={isPlaying} className="rounded-xl border border-white/10 text-white">
              <Shuffle className="mr-2 h-4 w-4" />
              Randomize
            </Button>
          </div>
        </div>

        {/* Side-by-side */}
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { instance: instanceA, algo: algoA, setAlgo: setAlgoA, label: "A" },
            { instance: instanceB, algo: algoB, setAlgo: setAlgoB, label: "B" },
          ].map(({ instance, algo, setAlgo, label }) => {
            const current = instance.steps[instance.currentStep];
            if (!current || current.snapshot.kind !== "array") return null;
            const bars = current.snapshot.bars;
            const maxVal = Math.max(...bars.map((b) => b.value));

            return (
              <div key={label} className="glass-card overflow-hidden p-5">
                {/* Selector */}
                <div className="mb-4 flex items-center justify-between">
                  <Select value={algo} onValueChange={(v) => setAlgo(v as AlgorithmKey)} disabled={isPlaying}>
                    <SelectTrigger className="w-48 rounded-xl border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-white/10 bg-slate-900">
                      {compareAlgorithmKeys.map((key) => (
                        <SelectItem key={key} value={key} className="text-white">
                          {algorithmInfoMap[key].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                    Step {instance.currentStep + 1}/{instance.steps.length}
                  </span>
                </div>

                {/* Bars */}
                <div className="flex h-48 items-end justify-center gap-[2px] rounded-xl bg-black/20 p-3 sm:h-64">
                  {bars.map((bar, i) => (
                    <motion.div
                      key={i}
                      className={`bg-gradient-to-t ${barColors[bar.state]}`}
                      style={{
                        width: `${Math.max(100 / bars.length - 1, 2)}%`,
                        borderRadius: "3px 3px 0 0",
                      }}
                      initial={false}
                      animate={{ height: `${(bar.value / maxVal) * 100}%` }}
                      transition={{ duration: 0.12 }}
                    />
                  ))}
                </div>

                {/* Label */}
                <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-slate-400">
                  {current.label}
                </p>

                {/* Metrics */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                    <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-cyan-400" />
                    <p className="text-sm font-bold text-white">{instance.steps.length}</p>
                    <p className="text-[10px] text-slate-500">Steps</p>
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                    <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-emerald-400" />
                    <p className="text-sm font-bold text-white">{instance.elapsedMs}ms</p>
                    <p className="text-[10px] text-slate-500">Runtime</p>
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                    <ArrowRightLeft className="mx-auto mb-1 h-3.5 w-3.5 text-violet-400" />
                    <p className="text-sm font-bold text-white">{instance.comparisons}</p>
                    <p className="text-[10px] text-slate-500">Comparisons</p>
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                    <Footprints className="mx-auto mb-1 h-3.5 w-3.5 text-pink-400" />
                    <p className="text-sm font-bold text-white">{instance.swaps}</p>
                    <p className="text-[10px] text-slate-500">Swaps</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
