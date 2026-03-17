import { type AlgorithmKey, algorithmInfoMap } from "@/lib/algorithms";

export interface ProgramAnalysisResult {
  algorithm: AlgorithmKey;
  inferredInputText: string;
  confidence: number;
  reason: string;
  estimatedTimeComplexity: string;
}

interface PatternRule {
  algorithm: AlgorithmKey;
  patterns: RegExp[];
  reason: string;
  confidence: number;
}

const RULES: PatternRule[] = [
  {
    algorithm: "bubble",
    patterns: [/bubble\s*sort/i, /arr\[j\]\s*>\s*arr\[j\s*\+\s*1\]/i, /swapp?ed/i],
    reason: "Detected adjacent comparisons and swap pattern used by Bubble Sort.",
    confidence: 0.92,
  },
  {
    algorithm: "selection",
    patterns: [/selection\s*sort/i, /min(index|Idx|min_index)/i, /for\s*\(.*i.*\)\s*\{[\s\S]*for\s*\(.*j/i],
    reason: "Detected minimum-selection scan pattern used by Selection Sort.",
    confidence: 0.88,
  },
  {
    algorithm: "insertion",
    patterns: [/insertion\s*sort/i, /key\s*=\s*arr\[/i, /while\s*\(.*arr\[j\]\s*>\s*key/i],
    reason: "Detected key-shift insertion pattern used by Insertion Sort.",
    confidence: 0.9,
  },
  {
    algorithm: "merge",
    patterns: [/merge\s*sort/i, /merge\s*\(/i, /slice\(0,\s*mid\)|copyOfRange|arr\[:mid\]/i],
    reason: "Detected divide-and-merge recursion pattern of Merge Sort.",
    confidence: 0.93,
  },
  {
    algorithm: "quick",
    patterns: [/quick\s*sort/i, /partition\s*\(/i, /pivot/i],
    reason: "Detected partition and pivot logic of Quick Sort.",
    confidence: 0.93,
  },
  {
    algorithm: "linearSearch",
    patterns: [/linear\s*search/i, /for\s*\(.*\)\s*\{[\s\S]*==\s*target/i, /return\s*-1/i],
    reason: "Detected sequential scan pattern of Linear Search.",
    confidence: 0.86,
  },
  {
    algorithm: "binarySearch",
    patterns: [/binary\s*search/i, /left\s*<=\s*right/i, /mid\s*=|middle\s*=/i],
    reason: "Detected midpoint narrowing logic of Binary Search.",
    confidence: 0.92,
  },
  {
    algorithm: "bfs",
    patterns: [/\bbfs\b/i, /queue|deque|popleft|shift\(/i, /visited/i],
    reason: "Detected queue-based traversal pattern of BFS.",
    confidence: 0.9,
  },
  {
    algorithm: "dfs",
    patterns: [/\bdfs\b/i, /stack|recurs/i, /visited/i],
    reason: "Detected depth-first traversal pattern of DFS.",
    confidence: 0.88,
  },
  {
    algorithm: "dijkstra",
    patterns: [/dijkstra/i, /priority\s*queue|heapq|min\s*heap/i, /dist\w*\[/i],
    reason: "Detected weighted shortest-path relaxation pattern of Dijkstra.",
    confidence: 0.94,
  },
  {
    algorithm: "bstInorder",
    patterns: [/inorder/i, /node\.left|node->left|left\s*=|left:/i, /node\.right|node->right|right\s*=|right:/i],
    reason: "Detected inorder traversal pattern in a binary search tree.",
    confidence: 0.87,
  },
];

function extractArrayInput(programText: string) {
  const arrayMatch = programText.match(/\[\s*(-?\d+(?:\s*,\s*-?\d+)*)\s*\]/);
  if (!arrayMatch) {
    return "";
  }
  const numbers = arrayMatch[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return numbers.join(", ");
}

function extractTarget(programText: string) {
  const explicit = programText.match(/target\s*=\s*(-?\d+)/i);
  if (explicit) {
    return Number(explicit[1]);
  }
  const compareLiteral = programText.match(/==\s*(-?\d+)/);
  if (compareLiteral) {
    return Number(compareLiteral[1]);
  }
  return undefined;
}

function inferInputForAlgorithm(algorithm: AlgorithmKey, programText: string) {
  if (algorithm === "bfs" || algorithm === "dfs") {
    return "A-B, A-C, B-D, C-E, D-F | start=A | target=F";
  }
  if (algorithm === "dijkstra") {
    return "A-B:4, A-C:2, B-D:5, C-D:1, D-E:3 | start=A | target=E";
  }
  if (algorithm === "bstInorder") {
    const parsed = extractArrayInput(programText);
    return parsed || "50, 30, 70, 20, 40, 60, 80";
  }

  const parsedArray = extractArrayInput(programText);
  if (algorithm === "linearSearch" || algorithm === "binarySearch") {
    const target = extractTarget(programText);
    if (parsedArray && Number.isFinite(target)) {
      return `${parsedArray} | target=${target}`;
    }
    if (parsedArray) {
      return parsedArray;
    }
    return algorithm === "linearSearch"
      ? "8, 12, 4, 19, 23 | target=19"
      : "2, 7, 9, 18, 31, 44 | target=18";
  }

  return parsedArray;
}

export function estimateAnalysisDelayMs(programText: string) {
  const normalized = programText.replace(/\s+/g, " ").trim();
  const tokenCount = normalized.length === 0 ? 0 : normalized.split(" ").length;
  const base = 700;
  const variable = Math.min(tokenCount * 18, 1700);
  return base + variable;
}

export function analyzeProgramText(programText: string): ProgramAnalysisResult | null {
  const text = programText.trim();
  if (text.length < 20) {
    return null;
  }

  let bestMatch: ProgramAnalysisResult | null = null;
  for (const rule of RULES) {
    const score = rule.patterns.reduce((sum, pattern) => sum + (pattern.test(text) ? 1 : 0), 0);
    if (score === 0) {
      continue;
    }
    const weightedConfidence = Math.min(0.98, rule.confidence * (score / rule.patterns.length));
    if (!bestMatch || weightedConfidence > bestMatch.confidence) {
      bestMatch = {
        algorithm: rule.algorithm,
        inferredInputText: inferInputForAlgorithm(rule.algorithm, text),
        confidence: weightedConfidence,
        reason: rule.reason,
        estimatedTimeComplexity: algorithmInfoMap[rule.algorithm].timeComplexity.average,
      };
    }
  }

  return bestMatch;
}
