# AlgoVisualiser

AlgoVisualiser is a Next.js algorithm studio with a registry-driven visualizer. Algorithms define their own metadata, code samples, input parser, random input generator, and step-by-step playback snapshots, so new algorithms can be added locally without rewriting the visualizer page or depending on an external service.

## Current Coverage

- Sorting: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort
- Searching: Linear Search, Binary Search
- Graphs: Breadth-First Search, Depth-First Search, Dijkstra's Algorithm
- Trees: BST Inorder Traversal
- Code samples for every algorithm in JavaScript, Python, Java, and C++
- Adaptive visualization modes for arrays, graphs, and trees

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Visualizer Input Formats

The visualizer supports dynamic custom input per algorithm:

- Array algorithms: `34, 12, 78, 5, 19`
- Search algorithms: `8, 12, 4, 19, 23 | target=19`
- Graph algorithms: `A-B, A-C, B-D, C-E | start=A | target=E`
- Weighted graph algorithms: `A-B:4, A-C:2, C-D:1 | start=A | target=D`
- Tree algorithms: `50, 30, 70, 20, 40, 60, 80`

## How To Add A New Algorithm

Add one entry in [src/lib/algorithms.ts](src/lib/algorithms.ts):

1. Define metadata such as name, category, complexity, supported code samples, and input schema.
2. Implement `createRandomInput` and `parseInput` for the algorithm's data shape.
3. Implement `generateSteps` to emit real step snapshots for `array`, `graph`, or `tree` visualization.
4. If the algorithm should appear in compare mode, set `compareSupported: true`.

The visualizer UI, code panel, step feed, and dynamic controls all read from that registry automatically.

## Notes

- Compare mode is intentionally limited to compare-supported array algorithms.
- Playback is driven entirely on the client with local state.
- Firebase auth and tracking remain available for user sessions and dashboards.
