import { create } from "zustand";
import {
  type AlgorithmInput,
  type AlgorithmKey,
  type AlgorithmStep,
  type CodeLanguage,
  createRandomInputForAlgorithm,
  getAlgorithmDefinition,
  generateSteps,
  parseInputForAlgorithm,
} from "@/lib/algorithms";

interface VisualizerState {
  algorithm: AlgorithmKey;
  arraySize: number;
  speed: number; // ms per step
  currentInput: AlgorithmInput;
  steps: AlgorithmStep[];
  currentStep: number;
  isPlaying: boolean;
  isComplete: boolean;
  customInput: string;
  codeLanguage: CodeLanguage;

  setAlgorithm: (algo: AlgorithmKey) => void;
  setArraySize: (size: number) => void;
  setSpeed: (speed: number) => void;
  setCustomInput: (input: string) => void;
  setCodeLanguage: (language: CodeLanguage) => void;
  applyCustomInput: () => void;
  randomize: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (step: number) => void;
}

const DEFAULT_SIZE = 20;
const DEFAULT_SPEED = 150;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function cloneInput(input: AlgorithmInput): AlgorithmInput {
  if (input.kind === "array") {
    return { ...input, values: [...input.values] };
  }
  if (input.kind === "graph") {
    return {
      ...input,
      nodes: [...input.nodes],
      edges: input.edges.map((edge) => ({ ...edge })),
    };
  }
  return { ...input, values: [...input.values] };
}

function getInputSize(input: AlgorithmInput) {
  if (input.kind === "graph") return input.nodes.length;
  return input.values.length;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => {
  const initialAlgorithm: AlgorithmKey = "bubble";
  const initialDefinition = getAlgorithmDefinition(initialAlgorithm);
  const initialSize = clamp(DEFAULT_SIZE, initialDefinition.input.minSize, initialDefinition.input.maxSize);
  const initialInput = createRandomInputForAlgorithm(initialAlgorithm, initialSize);
  const initialSteps = generateSteps(initialAlgorithm, cloneInput(initialInput));

  return {
    algorithm: initialAlgorithm,
    arraySize: initialSize,
    speed: DEFAULT_SPEED,
    currentInput: initialInput,
    steps: initialSteps,
    currentStep: 0,
    isPlaying: false,
    isComplete: false,
    customInput: "",
    codeLanguage: "javascript",

    setAlgorithm: (algo) => {
      const { arraySize } = get();
      const definition = getAlgorithmDefinition(algo);
      const nextSize = clamp(arraySize, definition.input.minSize, definition.input.maxSize);
      const nextInput = createRandomInputForAlgorithm(algo, nextSize);
      const steps = generateSteps(algo, cloneInput(nextInput));
      set({
        algorithm: algo,
        arraySize: nextSize,
        currentInput: nextInput,
        steps,
        currentStep: 0,
        isPlaying: false,
        isComplete: false,
        customInput: "",
      });
    },

    setArraySize: (size) => {
      const { algorithm } = get();
      const definition = getAlgorithmDefinition(algorithm);
      const nextSize = clamp(size, definition.input.minSize, definition.input.maxSize);
      const nextInput = createRandomInputForAlgorithm(algorithm, nextSize);
      const steps = generateSteps(algorithm, cloneInput(nextInput));
      set({
        arraySize: nextSize,
        currentInput: nextInput,
        steps,
        currentStep: 0,
        isPlaying: false,
        isComplete: false,
        customInput: "",
      });
    },

    setSpeed: (speed) => set({ speed }),

    setCustomInput: (input) => set({ customInput: input }),

    setCodeLanguage: (language) => set({ codeLanguage: language }),

    applyCustomInput: () => {
      const { customInput, algorithm } = get();
      const parsed = parseInputForAlgorithm(algorithm, customInput, get().arraySize);
      if (!parsed) return;

      const definition = getAlgorithmDefinition(algorithm);
      const parsedSize = clamp(
        getInputSize(parsed),
        definition.input.minSize,
        definition.input.maxSize
      );

      const steps = generateSteps(algorithm, cloneInput(parsed));
      set({
        currentInput: parsed,
        arraySize: parsedSize,
        steps,
        currentStep: 0,
        isPlaying: false,
        isComplete: false,
      });
    },

    randomize: () => {
      const { arraySize, algorithm } = get();
      const randomizedInput = createRandomInputForAlgorithm(algorithm, arraySize);
      const steps = generateSteps(algorithm, cloneInput(randomizedInput));
      set({
        currentInput: randomizedInput,
        steps,
        currentStep: 0,
        isPlaying: false,
        isComplete: false,
        customInput: "",
      });
    },

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),

    reset: () => {
      const { currentInput, algorithm } = get();
      const steps = generateSteps(algorithm, cloneInput(currentInput));
      set({ steps, currentStep: 0, isPlaying: false, isComplete: false });
    },

    stepForward: () => {
      const { currentStep, steps } = get();
      if (currentStep < steps.length - 1) {
        const next = currentStep + 1;
        set({ currentStep: next, isComplete: next === steps.length - 1 });
      } else {
        set({ isPlaying: false, isComplete: true });
      }
    },

    stepBackward: () => {
      const { currentStep } = get();
      if (currentStep > 0) {
        set({ currentStep: currentStep - 1, isComplete: false });
      }
    },

    goToStep: (step) => {
      const { steps } = get();
      const clamped = Math.max(0, Math.min(step, steps.length - 1));
      set({ currentStep: clamped, isComplete: clamped === steps.length - 1, isPlaying: false });
    },
  };
});
