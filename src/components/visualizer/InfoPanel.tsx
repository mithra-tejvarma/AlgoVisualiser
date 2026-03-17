"use client";

import { useMemo, useState } from "react";
import { useVisualizerStore } from "@/store/visualizerStore";
import {
  algorithmInfoMap,
  CODE_LANGUAGES,
  getAlgorithmDefinition,
} from "@/lib/algorithms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, HardDrive, Shield, Code2, ListChecks, Copy, Check } from "lucide-react";

export function InfoPanel() {
  const { algorithm, steps, currentStep, codeLanguage, setCodeLanguage } = useVisualizerStore();
  const info = algorithmInfoMap[algorithm];
  const definition = getAlgorithmDefinition(algorithm);
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  const [copied, setCopied] = useState(false);
  const languageLabel = useMemo(
    () => CODE_LANGUAGES.find(({ key }) => key === codeLanguage)?.label ?? "JS",
    [codeLanguage]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(info.code[codeLanguage]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="glass-card flex h-full flex-col p-5">
      <Tabs defaultValue="info" className="flex flex-1 flex-col min-h-0">
        <TabsList className="mb-4 w-full rounded-xl bg-secondary/60 p-1">
          <TabsTrigger value="info" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Info
          </TabsTrigger>
          <TabsTrigger value="code" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Code
          </TabsTrigger>
          <TabsTrigger value="steps" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Steps
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="flex-1 min-h-0 overflow-y-auto pr-2 subtle-scroll space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{info.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{info.description}</p>
          </div>

          {/* Complexity cards */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
              <Clock className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              <div className="flex-1">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Time Complexity</span>
                <div className="mt-0.5 flex gap-3 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400">Best: {info.timeComplexity.best}</span>
                  <span className="text-amber-600 dark:text-amber-400">Avg: {info.timeComplexity.average}</span>
                  <span className="text-rose-600 dark:text-rose-400">Worst: {info.timeComplexity.worst}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
              <HardDrive className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Space</span>
                <span className="text-xs text-foreground">{info.spaceComplexity}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
              <Shield className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Stable</span>
                <span className="text-xs text-foreground">{info.stable === null ? "N/A" : info.stable ? "Yes" : "No"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-secondary/50 px-4 py-3">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Category</span>
                <span className="text-xs capitalize text-foreground">{info.category}</span>
              </div>
              <div className="rounded-xl bg-secondary/50 px-4 py-3">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">View</span>
                <span className="text-xs capitalize text-foreground">{info.visualization}</span>
              </div>
            </div>
            <div className="rounded-xl bg-secondary/50 px-4 py-3">
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Input Format</span>
              <p className="mt-1 text-xs leading-relaxed text-foreground">{definition.input.helperText}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{definition.input.placeholder}</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code" className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-xs font-medium text-muted-foreground">Implementation ({languageLabel})</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Copy code"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Language switcher */}
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-secondary/60 p-1">
            {CODE_LANGUAGES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCodeLanguage(key)}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-all ${
                  codeLanguage === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <pre className="flex-1 overflow-auto rounded-xl border border-border bg-muted/40 p-4 text-[11px] leading-relaxed text-foreground/90 font-mono dark:bg-slate-950/70 dark:text-slate-200 min-h-0 subtle-scroll">
            <code>{info.code[codeLanguage]}</code>
          </pre>
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps" className="flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            <span className="text-xs font-medium text-muted-foreground">Step Feed</span>
          </div>
          <div className="flex-1 space-y-1 overflow-auto h-full pr-1 subtle-scroll">
            {steps.slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-xs transition-colors ${
                  i === currentStep
                    ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <span className="mr-2 text-muted-foreground/50">{i + 1}.</span>
                {step.label}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
