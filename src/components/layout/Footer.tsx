import { Triangle } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030712]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <Triangle className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-gradient-cyan">Prism</span>
                <span className="text-white">Algo</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              A premium algorithm visualization studio designed for learning, exploring, and mastering computer science fundamentals.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Product</h4>
            <ul className="space-y-2">
              {["Sorting Studio", "Pathfinding Arena", "Tree & Graph Lab", "DP & Recursion Lens"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-slate-500 transition-colors hover:text-slate-300 cursor-default">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Resources</h4>
            <ul className="space-y-2">
              {["Documentation", "Tutorials", "API Reference", "Community"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-slate-500 transition-colors hover:text-slate-300 cursor-default">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-slate-500 transition-colors hover:text-slate-300 cursor-default">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} PrismAlgo Studio. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <span key={item} className="text-xs text-slate-600 transition-colors hover:text-slate-400 cursor-default">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
