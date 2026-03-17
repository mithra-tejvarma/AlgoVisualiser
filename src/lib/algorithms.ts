export type BarState = "default" | "comparing" | "swapping" | "sorted" | "pivot" | "selected";

export type NodeState = "default" | "active" | "visited" | "frontier" | "source" | "target";

export type EdgeState = "default" | "active" | "visited" | "path";

export interface ArrayBar {
  value: number;
  state: BarState;
}

export interface VisualNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: NodeState;
  value?: number;
}

export interface VisualEdge {
  id: string;
  from: string;
  to: string;
  weight?: number;
  state: EdgeState;
  directed?: boolean;
}

export interface ArraySnapshot {
  kind: "array";
  bars: ArrayBar[];
}

export interface GraphSnapshot {
  kind: "graph";
  nodes: VisualNode[];
  edges: VisualEdge[];
}

export interface TreeSnapshot {
  kind: "tree";
  nodes: VisualNode[];
  edges: VisualEdge[];
}

export type VisualizationSnapshot = ArraySnapshot | GraphSnapshot | TreeSnapshot;

export interface AlgorithmStep {
  snapshot: VisualizationSnapshot;
  label: string;
  comparing?: string[];
  swapping?: string[];
}

export type CodeLanguage = "javascript" | "python" | "java" | "cpp";

export const CODE_LANGUAGES: { key: CodeLanguage; label: string }[] = [
  { key: "javascript", label: "JS" },
  { key: "python", label: "Python" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
];

export interface ArrayAlgorithmInput {
  kind: "array";
  values: number[];
  target?: number;
}

export interface GraphAlgorithmInput {
  kind: "graph";
  nodes: string[];
  edges: Array<{ from: string; to: string; weight?: number; directed?: boolean }>;
  start: string;
  target?: string;
}

export interface TreeAlgorithmInput {
  kind: "tree";
  values: number[];
}

export type AlgorithmInput = ArrayAlgorithmInput | GraphAlgorithmInput | TreeAlgorithmInput;

export interface AlgorithmInputSchema {
  sizeLabel: string;
  placeholder: string;
  helperText: string;
  minSize: number;
  maxSize: number;
  defaultSize: number;
}

export interface AlgorithmInfo {
  name: string;
  category: "sorting" | "searching" | "graph" | "tree";
  visualization: VisualizationSnapshot["kind"];
  description: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  stable: boolean | null;
  code: Record<CodeLanguage, string>;
  input: AlgorithmInputSchema;
}

interface AlgorithmDefinition extends AlgorithmInfo {
  compareSupported?: boolean;
  createRandomInput: (size: number) => AlgorithmInput;
  parseInput: (text: string, size: number) => AlgorithmInput | null;
  generateSteps: (input: AlgorithmInput) => AlgorithmStep[];
}

interface TreeNodeRecord {
  id: string;
  value: number;
  left: TreeNodeRecord | null;
  right: TreeNodeRecord | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function cloneBars(bars: ArrayBar[]) {
  return bars.map((bar) => ({ ...bar }));
}

function makeBars(values: number[]) {
  return values.map((value) => ({ value, state: "default" as BarState }));
}

function arrayStep(bars: ArrayBar[], label: string, comparing?: string[], swapping?: string[]): AlgorithmStep {
  return {
    snapshot: { kind: "array", bars: cloneBars(bars) },
    label,
    comparing,
    swapping,
  };
}

function nodeLabel(index: number) {
  return String.fromCharCode(65 + index);
}

function uniqueRandomValues(size: number, min = 5, max = 99) {
  const values = new Set<number>();
  while (values.size < size) {
    values.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return [...values];
}

export function generateRandomArray(size: number, min = 5, max = 100) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function parseNumberList(text: string) {
  return text
    .split(/[\s,]+/)
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));
}

function parseArrayInput(text: string) {
  const [valuesPart, targetPart] = text.split("|").map((part) => part.trim());
  const values = parseNumberList(valuesPart);
  if (values.length < 2) {
    return null;
  }

  let target: number | undefined;
  if (targetPart) {
    const match = targetPart.match(/target\s*=\s*(-?\d+)/i);
    if (match) {
      target = Number(match[1]);
    }
  }

  return { values, target };
}

function buildGraphInput(size: number, weighted = false): GraphAlgorithmInput {
  const nodeCount = clamp(size, 4, 8);
  const nodes = Array.from({ length: nodeCount }, (_, index) => nodeLabel(index));
  const edges: GraphAlgorithmInput["edges"] = [];

  for (let index = 0; index < nodeCount - 1; index++) {
    edges.push({
      from: nodes[index],
      to: nodes[index + 1],
      weight: weighted ? index + 2 : undefined,
    });
  }

  for (let index = 0; index < nodeCount - 2; index++) {
    edges.push({
      from: nodes[index],
      to: nodes[index + 2],
      weight: weighted ? index + 3 : undefined,
    });
  }

  if (nodeCount >= 6) {
    edges.push({ from: nodes[1], to: nodes[nodeCount - 1], weight: weighted ? 7 : undefined });
  }

  return {
    kind: "graph",
    nodes,
    edges,
    start: nodes[0],
    target: nodes[nodes.length - 1],
  };
}

function parseGraphInput(text: string, weighted = false): GraphAlgorithmInput | null {
  const sections = text
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (sections.length === 0) {
    return null;
  }

  const edgeTokens = sections[0]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (edgeTokens.length === 0) {
    return null;
  }

  const nodes = new Set<string>();
  const edges: GraphAlgorithmInput["edges"] = [];

  for (const token of edgeTokens) {
    const match = token.match(/^([A-Za-z0-9_]+)\s*([->])\s*([A-Za-z0-9_]+)(?::\s*(\d+))?$/);
    if (!match) {
      return null;
    }

    const from = match[1];
    const operator = match[2];
    const to = match[3];
    const weight = match[4] ? Number(match[4]) : undefined;

    nodes.add(from);
    nodes.add(to);
    edges.push({
      from,
      to,
      weight: weighted ? weight ?? 1 : undefined,
      directed: operator === ">",
    });
  }

  let start = [...nodes][0];
  let target = [...nodes][nodes.size - 1];

  for (const section of sections.slice(1)) {
    const startMatch = section.match(/start\s*=\s*([A-Za-z0-9_]+)/i);
    const targetMatch = section.match(/target\s*=\s*([A-Za-z0-9_]+)/i);
    if (startMatch) {
      start = startMatch[1];
    }
    if (targetMatch) {
      target = targetMatch[1];
    }
  }

  if (!nodes.has(start)) {
    return null;
  }

  return {
    kind: "graph",
    nodes: [...nodes],
    edges,
    start,
    target: nodes.has(target) ? target : undefined,
  };
}

function buildTreeInput(size: number): TreeAlgorithmInput {
  return {
    kind: "tree",
    values: uniqueRandomValues(clamp(size, 5, 11), 10, 99),
  };
}

function parseTreeInput(text: string): TreeAlgorithmInput | null {
  const values = parseNumberList(text);
  if (values.length < 2) {
    return null;
  }

  return {
    kind: "tree",
    values,
  };
}

function circularNodePositions(nodes: string[]) {
  return Object.fromEntries(
    nodes.map((node, index) => {
      const angle = ((Math.PI * 2) / nodes.length) * index - Math.PI / 2;
      return [
        node,
        {
          x: 50 + Math.cos(angle) * 34,
          y: 50 + Math.sin(angle) * 28,
        },
      ];
    })
  ) as Record<string, { x: number; y: number }>;
}

function graphStep(
  input: GraphAlgorithmInput,
  label: string,
  nodeStates: Partial<Record<string, NodeState>> = {},
  edgeStates: Partial<Record<string, EdgeState>> = {}
): AlgorithmStep {
  const positions = circularNodePositions(input.nodes);
  const nodes = input.nodes.map((node) => ({
    id: node,
    label: node,
    x: positions[node].x,
    y: positions[node].y,
    state:
      nodeStates[node] ??
      (node === input.start ? "source" : node === input.target ? "target" : "default"),
  }));

  const edges = input.edges.map((edge, index) => {
    const key = `${edge.from}-${edge.to}-${index}`;
    return {
      id: key,
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
      directed: edge.directed,
      state: edgeStates[key] ?? "default",
    };
  });

  return {
    snapshot: { kind: "graph", nodes, edges },
    label,
    comparing: Object.entries(edgeStates)
      .filter(([, state]) => state === "active")
      .map(([key]) => key),
  };
}

function edgeKey(edge: GraphAlgorithmInput["edges"][number], index: number) {
  return `${edge.from}-${edge.to}-${index}`;
}

function buildAdjacency(input: GraphAlgorithmInput) {
  const adjacency = new Map<string, Array<{ to: string; weight: number; key: string }>>();

  for (const node of input.nodes) {
    adjacency.set(node, []);
  }

  input.edges.forEach((edge, index) => {
    const key = edgeKey(edge, index);
    adjacency.get(edge.from)?.push({ to: edge.to, weight: edge.weight ?? 1, key });
    if (!edge.directed) {
      adjacency.get(edge.to)?.push({ to: edge.from, weight: edge.weight ?? 1, key });
    }
  });

  for (const value of adjacency.values()) {
    value.sort((left, right) => left.to.localeCompare(right.to));
  }

  return adjacency;
}

function pathEdgeStates(input: GraphAlgorithmInput, parents: Map<string, string>, target?: string) {
  if (!target || !parents.has(target)) {
    return {} as Partial<Record<string, EdgeState>>;
  }

  const states: Partial<Record<string, EdgeState>> = {};
  let current = target;
  while (parents.has(current)) {
    const parent = parents.get(current)!;
    input.edges.forEach((edge, index) => {
      if (
        (edge.from === parent && edge.to === current) ||
        (!edge.directed && edge.from === current && edge.to === parent) ||
        (!edge.directed && edge.from === parent && edge.to === current)
      ) {
        states[edgeKey(edge, index)] = "path";
      }
    });
    current = parent;
  }
  return states;
}

function insertTreeNode(root: TreeNodeRecord | null, value: number): TreeNodeRecord {
  if (!root) {
    return { id: String(value), value, left: null, right: null };
  }

  if (value < root.value) {
    root.left = insertTreeNode(root.left, value);
  } else if (value > root.value) {
    root.right = insertTreeNode(root.right, value);
  }
  return root;
}

function cloneTree(root: TreeNodeRecord | null): TreeNodeRecord | null {
  if (!root) {
    return null;
  }

  return {
    id: root.id,
    value: root.value,
    left: cloneTree(root.left),
    right: cloneTree(root.right),
  };
}

function layoutTree(root: TreeNodeRecord | null, states: Partial<Record<string, NodeState>>) {
  const nodes: VisualNode[] = [];
  const edges: VisualEdge[] = [];
  let order = 0;

  function assign(node: TreeNodeRecord | null, depth: number) {
    if (!node) {
      return;
    }

    assign(node.left, depth + 1);
    const x = 12 + order * 12;
    const y = 14 + depth * 18;
    order += 1;
    nodes.push({
      id: node.id,
      label: String(node.value),
      value: node.value,
      x,
      y,
      state: states[node.id] ?? "default",
    });
    assign(node.right, depth + 1);
  }

  function connect(node: TreeNodeRecord | null) {
    if (!node) {
      return;
    }
    if (node.left) {
      edges.push({ id: `${node.id}-${node.left.id}`, from: node.id, to: node.left.id, state: "default" });
      connect(node.left);
    }
    if (node.right) {
      edges.push({ id: `${node.id}-${node.right.id}`, from: node.id, to: node.right.id, state: "default" });
      connect(node.right);
    }
  }

  assign(root, 0);
  connect(root);

  return { nodes, edges };
}

function treeStep(root: TreeNodeRecord | null, label: string, states: Partial<Record<string, NodeState>> = {}): AlgorithmStep {
  const { nodes, edges } = layoutTree(root, states);
  return {
    snapshot: { kind: "tree", nodes, edges },
    label,
  };
}

function bubbleSortSteps(input: ArrayAlgorithmInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const bars = makeBars(input.values);
  steps.push(arrayStep(bars, "Initial array"));

  for (let outer = 0; outer < bars.length - 1; outer++) {
    for (let index = 0; index < bars.length - outer - 1; index++) {
      bars.forEach((bar, barIndex) => {
        bar.state = barIndex >= bars.length - outer ? "sorted" : "default";
      });
      bars[index].state = "comparing";
      bars[index + 1].state = "comparing";
      steps.push(arrayStep(bars, `Compare ${bars[index].value} and ${bars[index + 1].value}`, [`${index}`, `${index + 1}`]));

      if (bars[index].value > bars[index + 1].value) {
        bars[index].state = "swapping";
        bars[index + 1].state = "swapping";
        steps.push(arrayStep(bars, `Swap ${bars[index].value} with ${bars[index + 1].value}`, undefined, [`${index}`, `${index + 1}`]));
        [bars[index], bars[index + 1]] = [bars[index + 1], bars[index]];
      }
    }
    bars[bars.length - outer - 1].state = "sorted";
  }

  bars.forEach((bar) => {
    bar.state = "sorted";
  });
  steps.push(arrayStep(bars, "Array sorted"));
  return steps;
}

function selectionSortSteps(input: ArrayAlgorithmInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const bars = makeBars(input.values);
  steps.push(arrayStep(bars, "Initial array"));

  for (let start = 0; start < bars.length - 1; start++) {
    let minIndex = start;
    bars.forEach((bar, index) => {
      bar.state = index < start ? "sorted" : "default";
    });
    bars[minIndex].state = "selected";
    steps.push(arrayStep(bars, `Assume ${bars[minIndex].value} is the minimum`));

    for (let scan = start + 1; scan < bars.length; scan++) {
      bars.forEach((bar, index) => {
        bar.state = index < start ? "sorted" : index === minIndex ? "selected" : "default";
      });
      bars[scan].state = "comparing";
      steps.push(arrayStep(bars, `Compare ${bars[scan].value} with current min ${bars[minIndex].value}`, [`${scan}`, `${minIndex}`]));
      if (bars[scan].value < bars[minIndex].value) {
        minIndex = scan;
        bars.forEach((bar, index) => {
          bar.state = index < start ? "sorted" : index === minIndex ? "selected" : "default";
        });
        steps.push(arrayStep(bars, `${bars[minIndex].value} becomes the new minimum`));
      }
    }

    if (minIndex !== start) {
      bars[start].state = "swapping";
      bars[minIndex].state = "swapping";
      steps.push(arrayStep(bars, `Swap ${bars[start].value} with ${bars[minIndex].value}`, undefined, [`${start}`, `${minIndex}`]));
      [bars[start], bars[minIndex]] = [bars[minIndex], bars[start]];
    }
    bars[start].state = "sorted";
  }

  bars.forEach((bar) => {
    bar.state = "sorted";
  });
  steps.push(arrayStep(bars, "Array sorted"));
  return steps;
}

function insertionSortSteps(input: ArrayAlgorithmInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const bars = makeBars(input.values);
  bars[0].state = "sorted";
  steps.push(arrayStep(bars, "Initial array"));

  for (let index = 1; index < bars.length; index++) {
    const keyValue = bars[index].value;
    bars.forEach((bar, barIndex) => {
      bar.state = barIndex < index ? "sorted" : "default";
    });
    bars[index].state = "selected";
    steps.push(arrayStep(bars, `Insert ${keyValue} into the sorted prefix`));

    let cursor = index - 1;
    while (cursor >= 0 && bars[cursor].value > keyValue) {
      bars[cursor].state = "comparing";
      bars[cursor + 1].state = "comparing";
      steps.push(arrayStep(bars, `Shift ${bars[cursor].value} one position to the right`, [`${cursor}`, `${cursor + 1}`]));
      bars[cursor + 1] = { ...bars[cursor] };
      bars[cursor].state = cursor === 0 ? "sorted" : "default";
      cursor -= 1;
    }

    bars[cursor + 1] = { value: keyValue, state: "swapping" };
    steps.push(arrayStep(bars, `Place ${keyValue} at index ${cursor + 1}`, undefined, [`${cursor + 1}`]));
    for (let sortedIndex = 0; sortedIndex <= index; sortedIndex++) {
      bars[sortedIndex].state = "sorted";
    }
  }

  steps.push(arrayStep(bars, "Array sorted"));
  return steps;
}

function mergeSortSteps(input: ArrayAlgorithmInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const bars = makeBars(input.values);
  steps.push(arrayStep(bars, "Initial array"));

  function merge(left: number, middle: number, right: number) {
    const leftSlice = bars.slice(left, middle + 1).map((bar) => ({ ...bar }));
    const rightSlice = bars.slice(middle + 1, right + 1).map((bar) => ({ ...bar }));
    let leftIndex = 0;
    let rightIndex = 0;
    let writeIndex = left;

    while (leftIndex < leftSlice.length && rightIndex < rightSlice.length) {
      bars.forEach((bar) => {
        bar.state = "default";
      });
      bars[left + leftIndex].state = "comparing";
      bars[middle + 1 + rightIndex].state = "comparing";
      steps.push(arrayStep(bars, `Compare ${leftSlice[leftIndex].value} and ${rightSlice[rightIndex].value}`, [`${left + leftIndex}`, `${middle + 1 + rightIndex}`]));

      if (leftSlice[leftIndex].value <= rightSlice[rightIndex].value) {
        bars[writeIndex] = { value: leftSlice[leftIndex].value, state: "swapping" };
        steps.push(arrayStep(bars, `Write ${leftSlice[leftIndex].value} into the merged range`, undefined, [`${writeIndex}`]));
        leftIndex += 1;
      } else {
        bars[writeIndex] = { value: rightSlice[rightIndex].value, state: "swapping" };
        steps.push(arrayStep(bars, `Write ${rightSlice[rightIndex].value} into the merged range`, undefined, [`${writeIndex}`]));
        rightIndex += 1;
      }
      writeIndex += 1;
    }

    while (leftIndex < leftSlice.length) {
      bars[writeIndex] = { value: leftSlice[leftIndex].value, state: "swapping" };
      steps.push(arrayStep(bars, `Copy remaining value ${leftSlice[leftIndex].value}`, undefined, [`${writeIndex}`]));
      leftIndex += 1;
      writeIndex += 1;
    }

    while (rightIndex < rightSlice.length) {
      bars[writeIndex] = { value: rightSlice[rightIndex].value, state: "swapping" };
      steps.push(arrayStep(bars, `Copy remaining value ${rightSlice[rightIndex].value}`, undefined, [`${writeIndex}`]));
      rightIndex += 1;
      writeIndex += 1;
    }

    for (let index = left; index <= right; index++) {
      bars[index].state = "sorted";
    }
    steps.push(arrayStep(bars, `Merged subarray [${left}..${right}]`));
  }

  function split(left: number, right: number) {
    if (left >= right) {
      return;
    }

    const middle = Math.floor((left + right) / 2);
    bars.forEach((bar) => {
      bar.state = "default";
    });
    for (let index = left; index <= middle; index++) {
      bars[index].state = "pivot";
    }
    steps.push(arrayStep(bars, `Split range [${left}..${right}] into [${left}..${middle}] and [${middle + 1}..${right}]`));
    split(left, middle);
    split(middle + 1, right);
    merge(left, middle, right);
  }

  split(0, bars.length - 1);
  bars.forEach((bar) => {
    bar.state = "sorted";
  });
  steps.push(arrayStep(bars, "Array sorted"));
  return steps;
}

function quickSortSteps(input: ArrayAlgorithmInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const bars = makeBars(input.values);
  steps.push(arrayStep(bars, "Initial array"));

  function partition(low: number, high: number) {
    const pivot = bars[high].value;
    bars.forEach((bar, index) => {
      bar.state = index === high ? "pivot" : "default";
    });
    steps.push(arrayStep(bars, `Choose ${pivot} as pivot`));

    let smallerIndex = low;
    for (let scan = low; scan < high; scan++) {
      bars.forEach((bar, index) => {
        bar.state = index === high ? "pivot" : "default";
      });
      bars[scan].state = "comparing";
      steps.push(arrayStep(bars, `Compare ${bars[scan].value} with pivot ${pivot}`, [`${scan}`, `${high}`]));
      if (bars[scan].value < pivot) {
        if (smallerIndex !== scan) {
          bars[smallerIndex].state = "swapping";
          bars[scan].state = "swapping";
          steps.push(arrayStep(bars, `Swap ${bars[smallerIndex].value} with ${bars[scan].value}`, undefined, [`${smallerIndex}`, `${scan}`]));
          [bars[smallerIndex], bars[scan]] = [bars[scan], bars[smallerIndex]];
        }
        smallerIndex += 1;
      }
    }

    bars[smallerIndex].state = "swapping";
    bars[high].state = "swapping";
    steps.push(arrayStep(bars, `Place pivot ${pivot} at index ${smallerIndex}`, undefined, [`${smallerIndex}`, `${high}`]));
    [bars[smallerIndex], bars[high]] = [bars[high], bars[smallerIndex]];
    bars[smallerIndex].state = "sorted";
    steps.push(arrayStep(bars, `Pivot ${pivot} is now fixed`));
    return smallerIndex;
  }

  function sort(low: number, high: number) {
    if (low > high) {
      return;
    }
    if (low === high) {
      bars[low].state = "sorted";
      return;
    }
    const pivotIndex = partition(low, high);
    sort(low, pivotIndex - 1);
    sort(pivotIndex + 1, high);
  }

  sort(0, bars.length - 1);
  bars.forEach((bar) => {
    bar.state = "sorted";
  });
  steps.push(arrayStep(bars, "Array sorted"));
  return steps;
}

function linearSearchSteps(input: ArrayAlgorithmInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const bars = makeBars(input.values);
  const target = input.target ?? input.values[input.values.length - 1];
  steps.push(arrayStep(bars, `Search for ${target}`));

  for (let index = 0; index < bars.length; index++) {
    bars.forEach((bar, barIndex) => {
      bar.state = barIndex < index ? "sorted" : "default";
    });
    bars[index].state = "comparing";
    steps.push(arrayStep(bars, `Inspect index ${index}`, [`${index}`]));
    if (bars[index].value === target) {
      bars[index].state = "selected";
      steps.push(arrayStep(bars, `Found ${target} at index ${index}`));
      return steps;
    }
  }

  steps.push(arrayStep(bars, `${target} is not present in the array`));
  return steps;
}

function binarySearchSteps(input: ArrayAlgorithmInput): AlgorithmStep[] {
  const sortedValues = [...input.values].sort((left, right) => left - right);
  const bars = makeBars(sortedValues);
  const target = input.target ?? sortedValues[Math.floor(sortedValues.length / 2)];
  const steps: AlgorithmStep[] = [arrayStep(bars, `Sorted input before searching for ${target}`)];

  let left = 0;
  let right = bars.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    bars.forEach((bar, index) => {
      if (index < left || index > right) {
        bar.state = "sorted";
      } else {
        bar.state = "default";
      }
    });
    bars[middle].state = "pivot";
    steps.push(arrayStep(bars, `Check middle index ${middle}`, [`${middle}`]));

    if (bars[middle].value === target) {
      bars[middle].state = "selected";
      steps.push(arrayStep(bars, `Found ${target} at index ${middle}`));
      return steps;
    }

    if (bars[middle].value < target) {
      steps.push(arrayStep(bars, `${bars[middle].value} is too small, move right`));
      left = middle + 1;
    } else {
      steps.push(arrayStep(bars, `${bars[middle].value} is too large, move left`));
      right = middle - 1;
    }
  }

  steps.push(arrayStep(bars, `${target} is not present in the array`));
  return steps;
}

function bfsSteps(input: GraphAlgorithmInput): AlgorithmStep[] {
  const adjacency = buildAdjacency(input);
  const steps: AlgorithmStep[] = [];
  const queue = [input.start];
  const visited = new Set<string>([input.start]);
  const parents = new Map<string, string>();
  const nodeStates: Partial<Record<string, NodeState>> = { [input.start]: "frontier" };
  steps.push(graphStep(input, `Start BFS from ${input.start}`, nodeStates));

  while (queue.length > 0) {
    const current = queue.shift()!;
    nodeStates[current] = "active";
    steps.push(graphStep(input, `Visit ${current}`, nodeStates));

    if (current === input.target) {
      const highlightedEdges = pathEdgeStates(input, parents, input.target);
      nodeStates[current] = "target";
      steps.push(graphStep(input, `Reached target ${current}`, nodeStates, highlightedEdges));
      return steps;
    }

    for (const neighbor of adjacency.get(current) ?? []) {
      const edgeStates: Partial<Record<string, EdgeState>> = { [neighbor.key]: "active" };
      steps.push(graphStep(input, `Inspect edge ${current} -> ${neighbor.to}`, nodeStates, edgeStates));
      if (!visited.has(neighbor.to)) {
        visited.add(neighbor.to);
        parents.set(neighbor.to, current);
        queue.push(neighbor.to);
        nodeStates[neighbor.to] = neighbor.to === input.target ? "target" : "frontier";
        steps.push(graphStep(input, `Enqueue ${neighbor.to}`, nodeStates, edgeStates));
      }
    }

    nodeStates[current] = current === input.start ? "source" : "visited";
    steps.push(graphStep(input, `${current} fully processed`, nodeStates));
  }

  steps.push(graphStep(input, "BFS complete", nodeStates));
  return steps;
}

function dfsSteps(input: GraphAlgorithmInput): AlgorithmStep[] {
  const adjacency = buildAdjacency(input);
  const steps: AlgorithmStep[] = [];
  const stack = [input.start];
  const visited = new Set<string>();
  const parents = new Map<string, string>();
  const nodeStates: Partial<Record<string, NodeState>> = { [input.start]: "frontier" };
  steps.push(graphStep(input, `Start DFS from ${input.start}`, nodeStates));

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    nodeStates[current] = "active";
    steps.push(graphStep(input, `Pop ${current} and visit it`, nodeStates));

    if (current === input.target) {
      const highlightedEdges = pathEdgeStates(input, parents, input.target);
      nodeStates[current] = "target";
      steps.push(graphStep(input, `Reached target ${current}`, nodeStates, highlightedEdges));
      return steps;
    }

    const neighbors = [...(adjacency.get(current) ?? [])].reverse();
    for (const neighbor of neighbors) {
      const edgeStates: Partial<Record<string, EdgeState>> = { [neighbor.key]: "active" };
      steps.push(graphStep(input, `Inspect edge ${current} -> ${neighbor.to}`, nodeStates, edgeStates));
      if (!visited.has(neighbor.to)) {
        if (!parents.has(neighbor.to)) {
          parents.set(neighbor.to, current);
        }
        stack.push(neighbor.to);
        nodeStates[neighbor.to] = neighbor.to === input.target ? "target" : "frontier";
        steps.push(graphStep(input, `Push ${neighbor.to} onto the stack`, nodeStates, edgeStates));
      }
    }

    nodeStates[current] = current === input.start ? "source" : "visited";
    steps.push(graphStep(input, `${current} fully explored`, nodeStates));
  }

  steps.push(graphStep(input, "DFS complete", nodeStates));
  return steps;
}

function dijkstraSteps(input: GraphAlgorithmInput): AlgorithmStep[] {
  const adjacency = buildAdjacency(input);
  const steps: AlgorithmStep[] = [];
  const distances = new Map<string, number>();
  const parents = new Map<string, string>();
  const unvisited = new Set<string>(input.nodes);
  const nodeStates: Partial<Record<string, NodeState>> = { [input.start]: "source" };

  input.nodes.forEach((node) => {
    distances.set(node, node === input.start ? 0 : Number.POSITIVE_INFINITY);
  });

  steps.push(graphStep(input, `Initialize Dijkstra from ${input.start}`, nodeStates));

  while (unvisited.size > 0) {
    let current: string | null = null;
    for (const node of unvisited) {
      if (current === null || (distances.get(node) ?? Infinity) < (distances.get(current) ?? Infinity)) {
        current = node;
      }
    }

    if (!current || !Number.isFinite(distances.get(current) ?? Infinity)) {
      break;
    }

    nodeStates[current] = current === input.target ? "target" : "active";
    steps.push(graphStep(input, `Select ${current} with distance ${distances.get(current)}`, nodeStates));

    if (current === input.target) {
      const highlightedEdges = pathEdgeStates(input, parents, input.target);
      steps.push(graphStep(input, `Shortest path to ${current} fixed`, nodeStates, highlightedEdges));
      return steps;
    }

    for (const neighbor of adjacency.get(current) ?? []) {
      if (!unvisited.has(neighbor.to)) {
        continue;
      }
      const nextDistance = (distances.get(current) ?? Infinity) + neighbor.weight;
      const edgeStates: Partial<Record<string, EdgeState>> = { [neighbor.key]: "active" };
      steps.push(graphStep(input, `Relax ${current} -> ${neighbor.to} with weight ${neighbor.weight}`, nodeStates, edgeStates));

      if (nextDistance < (distances.get(neighbor.to) ?? Infinity)) {
        distances.set(neighbor.to, nextDistance);
        parents.set(neighbor.to, current);
        nodeStates[neighbor.to] = neighbor.to === input.target ? "target" : "frontier";
        steps.push(graphStep(input, `Update distance of ${neighbor.to} to ${nextDistance}`, nodeStates, edgeStates));
      }
    }

    unvisited.delete(current);
    nodeStates[current] = current === input.start ? "source" : "visited";
    steps.push(graphStep(input, `${current} is now finalized`, nodeStates));
  }

  const highlightedEdges = pathEdgeStates(input, parents, input.target);
  steps.push(graphStep(input, "Dijkstra complete", nodeStates, highlightedEdges));
  return steps;
}

function bstInorderSteps(input: TreeAlgorithmInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let root: TreeNodeRecord | null = null;
  const inserted: number[] = [];

  for (const value of input.values) {
    inserted.push(value);
    root = insertTreeNode(root, value);
    steps.push(treeStep(cloneTree(root), `Insert ${value} into the BST`, { [String(value)]: "frontier" }));
  }

  steps.push(treeStep(cloneTree(root), "BST built. Start inorder traversal."));

  const visitedStates: Partial<Record<string, NodeState>> = {};
  function traverse(node: TreeNodeRecord | null) {
    if (!node) {
      return;
    }
    steps.push(treeStep(cloneTree(root), `Traverse left from ${node.value}`, { ...visitedStates, [node.id]: "active" }));
    traverse(node.left);
    visitedStates[node.id] = "visited";
    steps.push(treeStep(cloneTree(root), `Visit ${node.value} in inorder`, { ...visitedStates }));
    traverse(node.right);
  }

  traverse(root);
  steps.push(treeStep(cloneTree(root), `Traversal complete: ${inserted.slice().sort((left, right) => left - right).join(", ")}`, visitedStates));
  return steps;
}

function codeBlock(javascript: string, python: string, java: string, cpp: string) {
  return {
    javascript,
    python,
    java,
    cpp,
  } satisfies Record<CodeLanguage, string>;
}

export const algorithmRegistry = {
  bubble: {
    name: "Bubble Sort",
    category: "sorting",
    visualization: "array",
    description: "Repeatedly compare adjacent elements and swap them until the largest values bubble to the end.",
    timeComplexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)" },
    spaceComplexity: "O(1)",
    stable: true,
    compareSupported: true,
    input: {
      sizeLabel: "Array Size",
      placeholder: "34, 12, 78, 5, 19",
      helperText: "Comma-separated numbers.",
      minSize: 5,
      maxSize: 40,
      defaultSize: 20,
    },
    code: codeBlock(
      `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      `def bubble_sort(arr):
    for i in range(len(arr) - 1):
        for j in range(len(arr) - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      `void bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        for (int j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
      `void bubbleSort(vector<int>& arr) {
    for (int i = 0; i < arr.size() - 1; i++) {
        for (int j = 0; j < arr.size() - i - 1; j++) {
            if (arr[j] > arr[j + 1]) swap(arr[j], arr[j + 1]);
        }
    }
}`
    ),
    createRandomInput: (size) => ({ kind: "array", values: generateRandomArray(size) }),
    parseInput: (text, _size) => {
      const parsed = parseArrayInput(text);
      return parsed ? { kind: "array", values: parsed.values } : null;
    },
    generateSteps: (input) => bubbleSortSteps(input as ArrayAlgorithmInput),
  },
  selection: {
    name: "Selection Sort",
    category: "sorting",
    visualization: "array",
    description: "Select the smallest remaining element and place it into the next sorted position.",
    timeComplexity: { best: "O(n^2)", average: "O(n^2)", worst: "O(n^2)" },
    spaceComplexity: "O(1)",
    stable: false,
    compareSupported: true,
    input: {
      sizeLabel: "Array Size",
      placeholder: "34, 12, 78, 5, 19",
      helperText: "Comma-separated numbers.",
      minSize: 5,
      maxSize: 40,
      defaultSize: 20,
    },
    code: codeBlock(
      `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) minIndex = j;
    }
    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
  }
  return arr;
}`,
      `def selection_sort(arr):
    for i in range(len(arr) - 1):
        min_index = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr`,
      `void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) minIndex = j;
        }
        int temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
}`,
      `void selectionSort(vector<int>& arr) {
    for (int i = 0; i < arr.size() - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < arr.size(); j++) {
            if (arr[j] < arr[minIndex]) minIndex = j;
        }
        swap(arr[i], arr[minIndex]);
    }
}`
    ),
    createRandomInput: (size) => ({ kind: "array", values: generateRandomArray(size) }),
    parseInput: (text, _size) => {
      const parsed = parseArrayInput(text);
      return parsed ? { kind: "array", values: parsed.values } : null;
    },
    generateSteps: (input) => selectionSortSteps(input as ArrayAlgorithmInput),
  },
  insertion: {
    name: "Insertion Sort",
    category: "sorting",
    visualization: "array",
    description: "Grow a sorted prefix by inserting each new element into its correct position.",
    timeComplexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)" },
    spaceComplexity: "O(1)",
    stable: true,
    compareSupported: true,
    input: {
      sizeLabel: "Array Size",
      placeholder: "34, 12, 78, 5, 19",
      helperText: "Comma-separated numbers.",
      minSize: 5,
      maxSize: 40,
      defaultSize: 20,
    },
    code: codeBlock(
      `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j -= 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
      `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
      `void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
    ),
    createRandomInput: (size) => ({ kind: "array", values: generateRandomArray(size) }),
    parseInput: (text, _size) => {
      const parsed = parseArrayInput(text);
      return parsed ? { kind: "array", values: parsed.values } : null;
    },
    generateSteps: (input) => insertionSortSteps(input as ArrayAlgorithmInput),
  },
  merge: {
    name: "Merge Sort",
    category: "sorting",
    visualization: "array",
    description: "Recursively split the array and merge sorted halves back together.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(n)",
    stable: true,
    compareSupported: true,
    input: {
      sizeLabel: "Array Size",
      placeholder: "34, 12, 78, 5, 19",
      helperText: "Comma-separated numbers.",
      minSize: 5,
      maxSize: 32,
      defaultSize: 16,
    },
    code: codeBlock(
      `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}`,
      `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    return result + left[i:] + right[j:]`,
      `int[] mergeSort(int[] arr) {
    if (arr.length <= 1) return arr;
    int mid = arr.length / 2;
    int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
    int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));
    return merge(left, right);
}`,
      `vector<int> mergeSort(vector<int> arr) {
    if (arr.size() <= 1) return arr;
    int mid = arr.size() / 2;
    vector<int> left(arr.begin(), arr.begin() + mid);
    vector<int> right(arr.begin() + mid, arr.end());
    left = mergeSort(left);
    right = mergeSort(right);
    return merge(left, right);
}`
    ),
    createRandomInput: (size) => ({ kind: "array", values: generateRandomArray(size) }),
    parseInput: (text, _size) => {
      const parsed = parseArrayInput(text);
      return parsed ? { kind: "array", values: parsed.values } : null;
    },
    generateSteps: (input) => mergeSortSteps(input as ArrayAlgorithmInput),
  },
  quick: {
    name: "Quick Sort",
    category: "sorting",
    visualization: "array",
    description: "Partition around a pivot and recursively sort the left and right partitions.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n^2)" },
    spaceComplexity: "O(log n)",
    stable: false,
    compareSupported: true,
    input: {
      sizeLabel: "Array Size",
      placeholder: "34, 12, 78, 5, 19",
      helperText: "Comma-separated numbers.",
      minSize: 5,
      maxSize: 28,
      defaultSize: 14,
    },
    code: codeBlock(
      `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low >= high) return arr;
  const pivotIndex = partition(arr, low, high);
  quickSort(arr, low, pivotIndex - 1);
  quickSort(arr, pivotIndex + 1, high);
  return arr;
}`,
      `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low >= high:
        return arr
    pivot_index = partition(arr, low, high)
    quick_sort(arr, low, pivot_index - 1)
    quick_sort(arr, pivot_index + 1, high)
    return arr`,
      `void quickSort(int[] arr, int low, int high) {
    if (low >= high) return;
    int pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
}`,
      `void quickSort(vector<int>& arr, int low, int high) {
    if (low >= high) return;
    int pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
}`
    ),
    createRandomInput: (size) => ({ kind: "array", values: generateRandomArray(size) }),
    parseInput: (text, _size) => {
      const parsed = parseArrayInput(text);
      return parsed ? { kind: "array", values: parsed.values } : null;
    },
    generateSteps: (input) => quickSortSteps(input as ArrayAlgorithmInput),
  },
  linearSearch: {
    name: "Linear Search",
    category: "searching",
    visualization: "array",
    description: "Walk through the array one element at a time until the target is found or the array ends.",
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
    stable: null,
    input: {
      sizeLabel: "Array Size",
      placeholder: "8, 12, 4, 19, 23 | target=19",
      helperText: "Use target=<value> to choose what to search for.",
      minSize: 5,
      maxSize: 40,
      defaultSize: 14,
    },
    code: codeBlock(
      `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
      `def linear_search(arr, target):
    for index, value in enumerate(arr):
        if value == target:
            return index
    return -1`,
      `int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      `int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
    ),
    createRandomInput: (size) => {
      const values = generateRandomArray(size);
      return { kind: "array", values, target: values[Math.floor(values.length / 2)] };
    },
    parseInput: (text, _size) => {
      const parsed = parseArrayInput(text);
      return parsed ? { kind: "array", values: parsed.values, target: parsed.target ?? parsed.values[parsed.values.length - 1] } : null;
    },
    generateSteps: (input) => linearSearchSteps(input as ArrayAlgorithmInput),
  },
  binarySearch: {
    name: "Binary Search",
    category: "searching",
    visualization: "array",
    description: "Search a sorted array by repeatedly halving the remaining search interval.",
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
    spaceComplexity: "O(1)",
    stable: null,
    input: {
      sizeLabel: "Array Size",
      placeholder: "2, 7, 9, 18, 31, 44 | target=18",
      helperText: "Values are sorted automatically before the search starts.",
      minSize: 5,
      maxSize: 40,
      defaultSize: 16,
    },
    code: codeBlock(
      `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      `int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
      `int binarySearch(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
    ),
    createRandomInput: (size) => {
      const values = uniqueRandomValues(size, 5, 90).sort((left, right) => left - right);
      return { kind: "array", values, target: values[Math.floor(values.length / 2)] };
    },
    parseInput: (text, _size) => {
      const parsed = parseArrayInput(text);
      if (!parsed) {
        return null;
      }
      const values = [...parsed.values].sort((left, right) => left - right);
      return { kind: "array", values, target: parsed.target ?? values[Math.floor(values.length / 2)] };
    },
    generateSteps: (input) => binarySearchSteps(input as ArrayAlgorithmInput),
  },
  bfs: {
    name: "Breadth-First Search",
    category: "graph",
    visualization: "graph",
    description: "Explore graph vertices level by level using a queue, which is ideal for shortest unweighted paths.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V)",
    stable: null,
    input: {
      sizeLabel: "Node Count",
      placeholder: "A-B, A-C, B-D, C-E, D-F | start=A | target=F",
      helperText: "Use A-B for undirected edges or A>B for directed edges.",
      minSize: 4,
      maxSize: 8,
      defaultSize: 6,
    },
    code: codeBlock(
      `function bfs(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  while (queue.length) {
    const node = queue.shift();
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
}`,
      `from collections import deque

def bfs(graph, start):
    queue = deque([start])
    visited = {start}
    while queue:
        node = queue.popleft()
        for nxt in graph.get(node, []):
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)`,
      `void bfs(Map<String, List<String>> graph, String start) {
    Queue<String> queue = new ArrayDeque<>();
    Set<String> visited = new HashSet<>();
    queue.add(start);
    visited.add(start);
    while (!queue.isEmpty()) {
        String node = queue.remove();
        for (String next : graph.getOrDefault(node, List.of())) {
            if (visited.add(next)) queue.add(next);
        }
    }
}`,
      `void bfs(const unordered_map<string, vector<string>>& graph, const string& start) {
    queue<string> q;
    unordered_set<string> visited;
    q.push(start);
    visited.insert(start);
    while (!q.empty()) {
        string node = q.front();
        q.pop();
        for (const string& next : graph.at(node)) {
            if (!visited.count(next)) {
                visited.insert(next);
                q.push(next);
            }
        }
    }
}`
    ),
    createRandomInput: (size) => buildGraphInput(size, false),
    parseInput: (text, _size) => parseGraphInput(text, false),
    generateSteps: (input) => bfsSteps(input as GraphAlgorithmInput),
  },
  dfs: {
    name: "Depth-First Search",
    category: "graph",
    visualization: "graph",
    description: "Explore as far as possible along each branch before backtracking.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V)",
    stable: null,
    input: {
      sizeLabel: "Node Count",
      placeholder: "A-B, A-C, B-D, C-E, D-F | start=A | target=F",
      helperText: "Use A-B for undirected edges or A>B for directed edges.",
      minSize: 4,
      maxSize: 8,
      defaultSize: 6,
    },
    code: codeBlock(
      `function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  for (const next of graph.get(start) ?? []) {
    if (!visited.has(next)) dfs(graph, next, visited);
  }
}`,
      `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    for nxt in graph.get(start, []):
        if nxt not in visited:
            dfs(graph, nxt, visited)`,
      `void dfs(Map<String, List<String>> graph, String start, Set<String> visited) {
    visited.add(start);
    for (String next : graph.getOrDefault(start, List.of())) {
        if (!visited.contains(next)) dfs(graph, next, visited);
    }
}`,
      `void dfs(const unordered_map<string, vector<string>>& graph, const string& start, unordered_set<string>& visited) {
    visited.insert(start);
    for (const string& next : graph.at(start)) {
        if (!visited.count(next)) dfs(graph, next, visited);
    }
}`
    ),
    createRandomInput: (size) => buildGraphInput(size, false),
    parseInput: (text, _size) => parseGraphInput(text, false),
    generateSteps: (input) => dfsSteps(input as GraphAlgorithmInput),
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    category: "graph",
    visualization: "graph",
    description: "Find the shortest weighted path by repeatedly finalizing the closest unfinished vertex.",
    timeComplexity: { best: "O((V + E) log V)", average: "O((V + E) log V)", worst: "O((V + E) log V)" },
    spaceComplexity: "O(V)",
    stable: null,
    input: {
      sizeLabel: "Node Count",
      placeholder: "A-B:4, A-C:2, B-D:5, C-D:1, D-E:3 | start=A | target=E",
      helperText: "Add :weight to each edge. Use A>B:4 for directed edges.",
      minSize: 4,
      maxSize: 8,
      defaultSize: 6,
    },
    code: codeBlock(
      `function dijkstra(graph, start) {
  const dist = new Map([[start, 0]]);
  const pq = [[0, start]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [cost, node] = pq.shift();
    for (const [next, weight] of graph.get(node) ?? []) {
      const nextCost = cost + weight;
      if (nextCost < (dist.get(next) ?? Infinity)) {
        dist.set(next, nextCost);
        pq.push([nextCost, next]);
      }
    }
  }
  return dist;
}`,
      `import heapq

def dijkstra(graph, start):
    dist = {start: 0}
    heap = [(0, start)]
    while heap:
        cost, node = heapq.heappop(heap)
        for nxt, weight in graph.get(node, []):
            next_cost = cost + weight
            if next_cost < dist.get(nxt, float('inf')):
                dist[nxt] = next_cost
                heapq.heappush(heap, (next_cost, nxt))
    return dist`,
      `Map<String, Integer> dijkstra(Map<String, List<Edge>> graph, String start) {
    Map<String, Integer> dist = new HashMap<>();
    PriorityQueue<EdgeState> pq = new PriorityQueue<>(Comparator.comparingInt(s -> s.cost));
    dist.put(start, 0);
    pq.add(new EdgeState(start, 0));
    while (!pq.isEmpty()) {
        EdgeState current = pq.remove();
        for (Edge edge : graph.getOrDefault(current.node, List.of())) {
            int nextCost = current.cost + edge.weight;
            if (nextCost < dist.getOrDefault(edge.to, Integer.MAX_VALUE)) {
                dist.put(edge.to, nextCost);
                pq.add(new EdgeState(edge.to, nextCost));
            }
        }
    }
    return dist;
}`,
      `unordered_map<string, int> dijkstra(const Graph& graph, const string& start) {
    unordered_map<string, int> dist;
    priority_queue<State, vector<State>, greater<State>> pq;
    dist[start] = 0;
    pq.push({0, start});
    while (!pq.empty()) {
        auto [cost, node] = pq.top();
        pq.pop();
        for (auto [next, weight] : graph.at(node)) {
            int nextCost = cost + weight;
            if (!dist.count(next) || nextCost < dist[next]) {
                dist[next] = nextCost;
                pq.push({nextCost, next});
            }
        }
    }
    return dist;
}`
    ),
    createRandomInput: (size) => buildGraphInput(size, true),
    parseInput: (text, _size) => parseGraphInput(text, true),
    generateSteps: (input) => dijkstraSteps(input as GraphAlgorithmInput),
  },
  bstInorder: {
    name: "BST Inorder Traversal",
    category: "tree",
    visualization: "tree",
    description: "Build a binary search tree from inserted values, then traverse it in sorted inorder sequence.",
    timeComplexity: { best: "O(n)", average: "O(n log n)", worst: "O(n^2)" },
    spaceComplexity: "O(h)",
    stable: null,
    input: {
      sizeLabel: "Tree Nodes",
      placeholder: "50, 30, 70, 20, 40, 60, 80",
      helperText: "Values are inserted into the BST in the order you provide.",
      minSize: 5,
      maxSize: 11,
      defaultSize: 7,
    },
    code: codeBlock(
      `function inorder(node, output = []) {
  if (!node) return output;
  inorder(node.left, output);
  output.push(node.value);
  inorder(node.right, output);
  return output;
}`,
      `def inorder(node, output=None):
    if output is None:
        output = []
    if not node:
        return output
    inorder(node.left, output)
    output.append(node.value)
    inorder(node.right, output)
    return output`,
      `void inorder(Node node, List<Integer> output) {
    if (node == null) return;
    inorder(node.left, output);
    output.add(node.value);
    inorder(node.right, output);
}`,
      `void inorder(Node* node, vector<int>& output) {
    if (!node) return;
    inorder(node->left, output);
    output.push_back(node->value);
    inorder(node->right, output);
}`
    ),
    createRandomInput: (size) => buildTreeInput(size),
    parseInput: (text, _size) => parseTreeInput(text),
    generateSteps: (input) => bstInorderSteps(input as TreeAlgorithmInput),
  },
} satisfies Record<string, AlgorithmDefinition>;

export type AlgorithmKey = keyof typeof algorithmRegistry;

export const algorithmEntries = Object.entries(algorithmRegistry) as [AlgorithmKey, AlgorithmDefinition][];

export const compareAlgorithmKeys = algorithmEntries
  .filter(([, definition]) => definition.compareSupported)
  .map(([key]) => key);

export const algorithmInfoMap: Record<AlgorithmKey, AlgorithmInfo> = Object.fromEntries(
  algorithmEntries.map(([key, definition]) => [
    key,
    {
      name: definition.name,
      category: definition.category,
      visualization: definition.visualization,
      description: definition.description,
      timeComplexity: definition.timeComplexity,
      spaceComplexity: definition.spaceComplexity,
      stable: definition.stable,
      code: definition.code,
      input: definition.input,
    },
  ])
) as Record<AlgorithmKey, AlgorithmInfo>;

export function getAlgorithmDefinition(key: AlgorithmKey) {
  return algorithmRegistry[key];
}

export function createRandomInputForAlgorithm(algorithm: AlgorithmKey, size: number) {
  return algorithmRegistry[algorithm].createRandomInput(size);
}

export function parseInputForAlgorithm(algorithm: AlgorithmKey, text: string, size: number) {
  return algorithmRegistry[algorithm].parseInput(text, size);
}

export function generateSteps(algorithm: AlgorithmKey, input: AlgorithmInput) {
  return algorithmRegistry[algorithm].generateSteps(input);
}


