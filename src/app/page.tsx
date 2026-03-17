"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  GitCompareArrows,
  TrendingUp,
  Cpu,
  Network,
  TreePine,
  Layers,
  Award,
  BookOpen,
  Share2,
  BrainCircuit,
  Target,
  MonitorPlay,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const statCards = [
  { label: "Algorithms", value: "4+", icon: Cpu },
  { label: "Smooth 60fps", value: "✓", icon: Zap },
  { label: "Step Control", value: "Full", icon: BarChart3 },
  { label: "Compare Mode", value: "Live", icon: GitCompareArrows },
];

const featureBadges = [
  "Bubble Sort",
  "Selection Sort",
  "Insertion Sort",
  "Merge Sort",
  "Step-by-Step",
  "Compare Mode",
  "Code Preview",
  "Custom Input",
];

/* ─── Roadmap Categories ─── */
const roadmapItems = [
  {
    title: "Sorting Studio",
    description: "Master comparison & distribution-based sorting with rich visualizations.",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-500/20",
    status: "Available",
    statusColor: "bg-emerald-500/20 text-emerald-400",
  },
  {
    title: "Pathfinding Arena",
    description: "Explore BFS, DFS, Dijkstra, A* on interactive grid maps.",
    icon: Network,
    gradient: "from-violet-500 to-pink-500",
    shadow: "shadow-violet-500/20",
    status: "Coming Soon",
    statusColor: "bg-violet-500/20 text-violet-400",
  },
  {
    title: "Tree & Graph Lab",
    description: "Visualize traversals, balancing, spanning trees and more.",
    icon: TreePine,
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
    status: "Coming Soon",
    statusColor: "bg-amber-500/20 text-amber-400",
  },
  {
    title: "DP & Recursion Lens",
    description: "Understand memoization, tabulation and recursive call stacks.",
    icon: Layers,
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
    status: "Planned",
    statusColor: "bg-slate-500/20 text-slate-400",
  },
];

/* ─── Learn Features ─── */
const learnFeatures = [
  {
    icon: BrainCircuit,
    title: "AI Explain Mode",
    description: "Get intelligent, step-by-step explanations of what each algorithm is doing and why.",
    gradient: "from-violet-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Challenge Mode",
    description: "Test your understanding with interactive challenges and timed exercises.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Share2,
    title: "Export & Share",
    description: "Export visualizations as images or shareable links for easy collaboration.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: MonitorPlay,
    title: "Multi-View Canvas",
    description: "View algorithms from multiple perspectives — bars, dots, color map, and more.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: BookOpen,
    title: "Learning Tracks",
    description: "Follow curated paths from beginner to advanced, with progress tracking.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Award,
    title: "Achievements",
    description: "Earn badges and track milestones as you master different algorithm categories.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ───── HERO ───── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[100px]" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400">
            <Sparkles className="h-4 w-4" />
            Premium Algorithm Visualization
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
            <span className="text-foreground">Visualize.</span>{" "}
            <span className="text-gradient-cyan">Understand.</span>{" "}
            <span className="text-foreground">Master.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Experience algorithms like never before. PrismAlgo Studio brings sorting, pathfinding, trees, and dynamic programming to life with cinematic animations and interactive step controls.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/visualizer"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110"
            >
              Launch Studio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary/50 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-all hover:bg-secondary"
            >
              <GitCompareArrows className="h-4 w-4" />
              Compare Algorithms
            </Link>
          </motion.div>

          {/* Feature badges */}
          <motion.div variants={fadeUp} custom={4} className="mt-10 flex flex-wrap justify-center gap-2">
            {featureBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero stat cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              variants={fadeUp}
              custom={5 + i}
              className="glass-card flex flex-col items-center gap-2 p-5 text-center transition-all hover:border-cyan-500/20"
            >
              <card.icon className="h-6 w-6 text-cyan-400" />
              <span className="text-2xl font-bold text-foreground">{card.value}</span>
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ───── ROADMAP / CATEGORIES ───── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Algorithm <span className="text-gradient-cyan">Categories</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Explore our growing library of beautifully visualized algorithm families.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {roadmapItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card group p-6 transition-all hover:border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} ${item.shadow} shadow-lg`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── LEARN / FEATURES ───── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
              <TrendingUp className="h-4 w-4" />
              Premium Features
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
              Learn <span className="text-gradient-violet">Smarter</span>, Not Harder
            </h2>
            <p className="mt-3 text-muted-foreground">
              State-of-the-art tools designed to accelerate your algorithm mastery.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learnFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card group p-6 transition-all hover:border-white/10"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
