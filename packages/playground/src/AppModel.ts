import { compile, type NewtError } from "@newt-lang/compiler";
import { examples } from "./examples.js";
import { createSimulation, type SimulatedMessage, type Simulation } from "./simulationEngine.js";

export type CompileStatus = "idle" | "compiling" | "error" | "running";

export interface PlaygroundState {
  source: string;
  selectedExample: string;
  errors: NewtError[];
  messages: SimulatedMessage[];
  status: CompileStatus;
  compiledInMs: number;
}

export class PlaygroundModel {
  state: PlaygroundState;
  private simulation: Simulation;

  constructor(initialSource = examples[0]?.source ?? "") {
    this.state = {
      source: initialSource,
      selectedExample: examples[0]?.id ?? "custom",
      errors: [],
      messages: [],
      status: "idle",
      compiledInMs: 0
    };
    this.simulation = createSimulation(initialSource);
    this.compile(initialSource);
  }

  compile(source: string): PlaygroundState {
    const start = performance.now();
    const result = compile(source, "playground.newt");
    this.state.source = source;
    this.state.compiledInMs = Math.round(performance.now() - start);
    if (!result.success) {
      this.state.errors = result.errors;
      this.state.status = "error";
    } else {
      this.state.errors = [];
      this.state.status = "running";
      this.simulation = createSimulation(source);
    }
    return this.state;
  }

  loadExample(id: string): PlaygroundState {
    const example = examples.find((item) => item.id === id) ?? examples[0];
    this.state.selectedExample = example.id;
    this.state.messages = [];
    return this.compile(example.source);
  }

  sendMessage(content: string): PlaygroundState {
    this.state.messages = [...this.state.messages, ...this.simulation.sendMessage(content)];
    return this.state;
  }

  join(memberName = "Riley"): PlaygroundState {
    this.state.messages = [...this.state.messages, ...this.simulation.triggerJoin(memberName)];
    return this.state;
  }
}
