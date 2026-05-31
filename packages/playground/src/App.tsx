import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Play, UserPlus } from "lucide-react";
import { compile, type NewtError } from "@newt-lang/compiler";
import { Editor } from "./Editor.js";
import { SimulatedChat } from "./SimulatedChat.js";
import { examples } from "./examples.js";
import { createSimulation, type SimulatedMessage, type Simulation } from "./simulationEngine.js";

type CompileStatus = "idle" | "error" | "running";

interface CompileState {
  errors: NewtError[];
  status: CompileStatus;
  compiledInMs: number;
}

function sourceFromHash(): string | undefined {
  if (!window.location.hash.slice(1)) return undefined;
  try {
    return atob(decodeURIComponent(window.location.hash.slice(1)));
  } catch {
    return undefined;
  }
}

export function App() {
  const initialSource = sourceFromHash() ?? examples[0]?.source ?? "";
  const [source, setSource] = useState(initialSource);
  const [selectedExample, setSelectedExample] = useState(examples[0]?.id ?? "custom");
  const [compileState, setCompileState] = useState<CompileState>({ errors: [], status: "idle", compiledInMs: 0 });
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const [simulation, setSimulation] = useState<Simulation>(() => createSimulation(initialSource));
  const errorCount = compileState.errors.length;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const started = performance.now();
      const result = compile(source, "playground.newt");
      const compiledInMs = Math.round(performance.now() - started);
      if (result.success) {
        setCompileState({ errors: [], status: "running", compiledInMs });
        setSimulation(() => createSimulation(source));
      } else {
        setCompileState({ errors: result.errors, status: "error", compiledInMs });
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [source]);

  const statusText = useMemo(() => {
    if (compileState.status === "error") return `${errorCount} error${errorCount === 1 ? "" : "s"}`;
    if (compileState.status === "running") return `Compiled in ${compileState.compiledInMs}ms`;
    return "Ready";
  }, [compileState, errorCount]);

  function loadExample(id: string) {
    const example = examples.find((item) => item.id === id);
    if (!example) return;
    setSelectedExample(id);
    setSource(example.source);
    setMessages([]);
  }

  function share() {
    const hash = encodeURIComponent(btoa(source));
    window.history.replaceState(null, "", `#${hash}`);
    void navigator.clipboard?.writeText(window.location.href);
  }

  function sendMessage(content: string) {
    setMessages((current) => [...current, ...simulation.sendMessage(content)]);
  }

  function joinServer() {
    setMessages((current) => [...current, ...simulation.triggerJoin("Riley")]);
  }

  function reactThumbsUp() {
    setMessages((current) => [...current, ...simulation.triggerReaction("👍", current.at(-1)?.id ?? "latest")]);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="newt-mark">Newt</span>
          <span className="tagline">Small script, big bot.</span>
        </div>
        <div className="toolbar">
          <select value={selectedExample} onChange={(event) => loadExample(event.target.value)} aria-label="Example">
            {examples.map((example) => (
              <option key={example.id} value={example.id}>
                {example.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={share} title="Copy share link">
            <Copy size={16} />
            Share
          </button>
          <button type="button" disabled title="Cloud deploy is not wired yet">
            <Play size={16} />
            Deploy
          </button>
        </div>
      </header>

      <section className="workspace">
        <div className="editor-pane">
          <Editor value={source} onChange={setSource} errors={compileState.errors} />
        </div>
        <div className="chat-pane">
          <SimulatedChat
            messages={messages}
            onSendMessage={sendMessage}
            onJoin={joinServer}
            onReaction={reactThumbsUp}
          />
        </div>
      </section>

      <footer className="statusbar">
        <span className={compileState.status === "error" ? "status-error" : "status-ok"}>
          {compileState.status === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          {statusText}
        </span>
        <button type="button" onClick={joinServer} title="Trigger join event">
          <UserPlus size={15} />
          Join
        </button>
      </footer>
    </main>
  );
}
