"use client";

import { useVisualizerStore } from "@/store/visualizerStore";
import { algorithmInfoMap, getAlgorithmDefinition, type AlgorithmKey } from "@/lib/algorithms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  SkipBack,
  SkipForward,
  Keyboard,
} from "lucide-react";
import { useState } from "react";

export function ControlPanel() {
  const {
    algorithm,
    arraySize,
    speed,
    isPlaying,
    isComplete,
    customInput,
    setAlgorithm,
    setArraySize,
    setSpeed,
    setCustomInput,
    applyCustomInput,
    randomize,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
  } = useVisualizerStore();

  const [showCustomInput, setShowCustomInput] = useState(false);
  const definition = getAlgorithmDefinition(algorithm);

  return (
    <div className="glass-card flex h-full flex-col gap-5 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Controls</h2>

      {/* Algorithm Selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Algorithm</label>
        <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as AlgorithmKey)}>
          <SelectTrigger className="w-full rounded-xl border-white/10 bg-white/5 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-white/10 bg-slate-900">
            {Object.entries(algorithmInfoMap).map(([key, info]) => (
              <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
                {info.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Array Size */}
      <div>
        <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>{definition.input.sizeLabel}</span>
          <span className="text-cyan-400">{arraySize}</span>
        </label>
        <Slider
          value={[arraySize]}
          onValueChange={(v) => setArraySize(Array.isArray(v) ? v[0] : v)}
          min={definition.input.minSize}
          max={definition.input.maxSize}
          step={1}
          disabled={isPlaying}
          className="mt-2"
        />
      </div>

      {/* Speed */}
      <div>
        <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Speed</span>
          <span className="text-cyan-400">{speed}ms</span>
        </label>
        <Slider
          value={[speed]}
          onValueChange={(v) => setSpeed(Array.isArray(v) ? v[0] : v)}
          min={10}
          max={500}
          step={10}
          className="mt-2"
        />
      </div>

      {/* Custom Input */}
      <div>
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-white"
        >
          <Keyboard className="h-3.5 w-3.5" />
          Custom Input
        </button>
        {showCustomInput && (
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={definition.input.placeholder}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
            />
            <Button
              onClick={applyCustomInput}
              size="sm"
              variant="secondary"
              className="rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
            >
              Apply
            </Button>
          </div>
        )}
        {showCustomInput && (
          <p className="mt-2 text-[11px] text-slate-500">{definition.input.helperText}</p>
        )}
      </div>

      {/* Playback Controls */}
      <div className="mt-auto">
        <div className="grid grid-cols-5 gap-2">
          <Button
            onClick={stepBackward}
            size="icon"
            variant="ghost"
            disabled={isPlaying}
            className="rounded-xl border border-white/5 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
            aria-label="Step backward"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={isPlaying ? pause : play}
            size="icon"
            disabled={isComplete}
            className="col-span-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 disabled:opacity-30"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            onClick={stepForward}
            size="icon"
            variant="ghost"
            disabled={isPlaying || isComplete}
            className="rounded-xl border border-white/5 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
            aria-label="Step forward"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            onClick={reset}
            size="icon"
            variant="ghost"
            className="rounded-xl border border-white/5 bg-white/5 text-white hover:bg-white/10"
            aria-label="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={randomize}
            size="icon"
            variant="ghost"
            disabled={isPlaying}
            className="rounded-xl border border-white/5 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
            aria-label="Randomize"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
