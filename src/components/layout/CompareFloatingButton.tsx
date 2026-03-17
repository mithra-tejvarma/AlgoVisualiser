"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompareArrows, Plus, X, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { algorithmInfoMap, type AlgorithmKey } from "@/lib/algorithms";
import { useVisualizerStore } from "@/store/visualizerStore";

const STORAGE_KEY = "compare.selection";
const MAX_COMPARE_ITEMS = 4;

function toAlgorithmKey(value: string): value is AlgorithmKey {
  return value in algorithmInfoMap;
}

export function CompareFloatingButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { algorithm: currentAlgorithm } = useVisualizerStore();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AlgorithmKey[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as string[];
      setSelected(parsed.filter(toAlgorithmKey));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  const selectedLabel = useMemo(() => {
    if (selected.length === 0) {
      return "No algorithms selected yet";
    }
    return selected.map((algo) => algorithmInfoMap[algo].name).join(" vs ");
  }, [selected]);

  if (pathname === "/compare") {
    return null;
  }

  const addAlgorithm = (algorithm: AlgorithmKey) => {
    setSelected((prev) => {
      const deduped = [algorithm, ...prev.filter((item) => item !== algorithm)];
      return deduped.slice(0, MAX_COMPARE_ITEMS);
    });
  };

  const handleOpenCompare = () => {
    const [algoA, algoB] = selected;
    const params = new URLSearchParams();
    if (algoA) {
      params.set("algoA", algoA);
    }
    if (algoB) {
      params.set("algoB", algoB);
    }
    const query = params.toString();
    router.push(query ? `/compare?${query}` : "/compare");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="mb-3 w-[320px] rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white">Compare Queue</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{selectedLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close compare queue"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {pathname.startsWith("/visualizer") && (
              <Button
                type="button"
                onClick={() => addAlgorithm(currentAlgorithm)}
                className="mb-3 w-full justify-start rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Current: {algorithmInfoMap[currentAlgorithm].name}
              </Button>
            )}

            <div className="mb-3 max-h-28 space-y-2 overflow-auto pr-1">
              {selected.map((algorithm) => (
                <div key={algorithm} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-xs text-slate-200">{algorithmInfoMap[algorithm].name}</span>
                  <button
                    type="button"
                    onClick={() => setSelected((prev) => prev.filter((item) => item !== algorithm))}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={`Remove ${algorithmInfoMap[algorithm].name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {selected.length === 0 && (
                <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-400">
                  Add algorithms from the visualizer, then open compare.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelected([])}
                className="rounded-xl border border-white/10 text-slate-200 hover:bg-white/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleOpenCompare}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              >
                Compare
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-12 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-5 text-white shadow-xl shadow-violet-500/30"
      >
        <GitCompareArrows className="mr-2 h-4 w-4" />
        Compare
      </Button>
    </div>
  );
}
