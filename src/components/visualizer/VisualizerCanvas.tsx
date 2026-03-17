"use client";

import { useVisualizerStore } from "@/store/visualizerStore";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type {
  BarState,
  EdgeState,
  GraphSnapshot,
  NodeState,
  TreeSnapshot,
  VisualNode,
} from "@/lib/algorithms";
import { Maximize2, Minus, Move, Plus } from "lucide-react";

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

const nodeStyles: Record<NodeState, { fill: string; ring: string }> = {
  default: { fill: "#0f172a", ring: "#64748b" },
  active: { fill: "#0e7490", ring: "#22d3ee" },
  visited: { fill: "#0f766e", ring: "#2dd4bf" },
  frontier: { fill: "#581c87", ring: "#c084fc" },
  source: { fill: "#14532d", ring: "#4ade80" },
  target: { fill: "#7f1d1d", ring: "#f87171" },
};

const edgeStyles: Record<EdgeState, string> = {
  default: "#475569",
  active: "#22d3ee",
  visited: "#2dd4bf",
  path: "#f97316",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizePositions(nodes: VisualNode[]) {
  const minX = Math.min(...nodes.map((node) => node.x));
  const maxX = Math.max(...nodes.map((node) => node.x));
  const minY = Math.min(...nodes.map((node) => node.y));
  const maxY = Math.max(...nodes.map((node) => node.y));

  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  const pad = 8;
  const usable = 100 - pad * 2;

  return Object.fromEntries(
    nodes.map((node) => [
      node.id,
      {
        x: pad + ((node.x - minX) / spanX) * usable,
        y: pad + ((node.y - minY) / spanY) * usable,
      },
    ])
  ) as Record<string, { x: number; y: number }>;
}

function GraphTreeScene({ snapshot }: { snapshot: GraphSnapshot | TreeSnapshot }) {
  const positions = useMemo(() => normalizePositions(snapshot.nodes), [snapshot.nodes]);
  const nodeMap = useMemo(
    () => Object.fromEntries(snapshot.nodes.map((node) => [node.id, node])) as Record<string, VisualNode>,
    [snapshot.nodes]
  );

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <marker
          id="arrowHead"
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="#64748b" />
        </marker>
      </defs>

      {snapshot.edges.map((edge) => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        if (!from || !to) return null;
        const color = edgeStyles[edge.state];

        return (
          <g key={edge.id}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth={edge.state === "path" ? 1.2 : 0.7}
              strokeLinecap="round"
              markerEnd={edge.directed ? "url(#arrowHead)" : undefined}
              opacity={0.9}
            />
            {typeof edge.weight === "number" && (
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 1.2}
                textAnchor="middle"
                className="fill-slate-300 text-[2.8px] font-semibold"
              >
                {edge.weight}
              </text>
            )}
          </g>
        );
      })}

      {snapshot.nodes.map((node) => {
        const point = positions[node.id];
        if (!point) return null;
        const style = nodeStyles[node.state];

        return (
          <g key={node.id}>
            <circle cx={point.x} cy={point.y} r="3.1" fill={style.fill} stroke={style.ring} strokeWidth="0.8" />
            <text
              x={point.x}
              y={point.y + 0.9}
              textAnchor="middle"
              className="fill-slate-100 text-[2.7px] font-semibold"
            >
              {nodeMap[node.id].label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function VisualizerCanvas() {
  const { steps, currentStep } = useVisualizerStore();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pointerStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const current = steps[currentStep];
  if (!current) return null;

  const snapshot = current.snapshot;
  const isArray = snapshot.kind === "array";

  const bars = isArray ? snapshot.bars : [];
  const maxVal = bars.length ? Math.max(...bars.map((bar) => bar.value)) : 1;
  const barCount = bars.length;

  const canPanZoom = !isArray;

  const zoomIn = () => setZoom((prev) => clamp(prev + 0.1, 0.5, 2.5));
  const zoomOut = () => setZoom((prev) => clamp(prev - 0.1, 0.5, 2.5));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (!canPanZoom) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => clamp(prev + delta, 0.5, 2.5));
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!canPanZoom) return;
    setIsPanning(true);
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!canPanZoom || !pointerStart.current) return;
    const nextX = pointerStart.current.panX + (event.clientX - pointerStart.current.x);
    const nextY = pointerStart.current.panY + (event.clientY - pointerStart.current.y);
    setPan({ x: nextX, y: nextY });
  };

  const onPointerUp = () => {
    setIsPanning(false);
    pointerStart.current = null;
  };

  return (
    <div className="glass-card flex h-full flex-col overflow-hidden p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Visualization
        </h2>
        <div className="flex items-center gap-2">
          {canPanZoom && (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <button onClick={zoomOut} className="rounded-md p-1 text-slate-300 transition hover:bg-white/10" aria-label="Zoom out">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-12 text-center text-xs text-slate-300">{Math.round(zoom * 100)}%</span>
              <button onClick={zoomIn} className="rounded-md p-1 text-slate-300 transition hover:bg-white/10" aria-label="Zoom in">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button onClick={resetView} className="rounded-md p-1 text-slate-300 transition hover:bg-white/10" aria-label="Reset view">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
            Step {currentStep + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        ref={viewportRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className={`relative flex flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 ${
          canPanZoom ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
      >
        {isArray ? (
          <div className="flex h-full w-full items-end justify-center gap-[2px] px-3 pb-3">
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
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-75"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            <GraphTreeScene snapshot={snapshot} />
          </div>
        )}

        {canPanZoom && (
          <>
            <motion.div
              drag
              dragMomentum={false}
              dragConstraints={viewportRef}
              className="absolute left-3 top-3 w-52 rounded-xl border border-cyan-500/20 bg-slate-900/85 p-3 backdrop-blur"
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <Move className="h-3.5 w-3.5" />
                Navigator
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Drag to pan. Use mouse wheel or +/- controls to zoom.
              </p>
              <p className="mt-2 text-[10px] text-slate-400">
                Pan: {Math.round(pan.x)}, {Math.round(pan.y)}
              </p>
            </motion.div>

            <motion.div
              drag
              dragMomentum={false}
              dragConstraints={viewportRef}
              className="absolute right-3 top-3 rounded-xl border border-violet-500/20 bg-slate-900/85 px-3 py-2 text-[11px] text-slate-300 backdrop-blur"
            >
              <p className="font-semibold text-violet-300">
                {snapshot.kind === "graph" ? "Graph" : "Tree"} stats
              </p>
              <p className="mt-1">Nodes: {snapshot.nodes.length}</p>
              <p>Edges: {snapshot.edges.length}</p>
            </motion.div>
          </>
        )}
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
