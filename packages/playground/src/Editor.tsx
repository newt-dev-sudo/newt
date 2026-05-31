import { useEffect, useRef } from "react";
import { Editor as MonacoReactEditor, type OnMount } from "@monaco-editor/react";
import type { NewtError } from "@newt-lang/compiler";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  errors: NewtError[];
  readOnly?: boolean;
}

export function Editor({ value, onChange, errors, readOnly = false }: EditorProps) {
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (!monaco.languages.getLanguages().some((language: { id: string }) => language.id === "newt")) {
      monaco.languages.register({ id: "newt", extensions: [".newt"] });
      monaco.languages.setMonarchTokensProvider("newt", {
        tokenizer: {
          root: [
            [/#.*$/, "comment"],
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
            [/#[0-9a-fA-F]{6}\b/, "number.hex"],
            [/\b\d+(\.\d+)?\b/, "number"],
            [/\b(bot|name|prefix|token|from|env)\b/, "keyword"],
            [/\b(on|ready|command|join|leave|message|contains|reaction|add)\b/, "type"],
            [/\b(reply|say|give|remove|require|store|load|fetch|mute|kick|ban|pin|wait|every|at|daily|embed|title|description|color|field)\b/, "keyword"],
            [/\b(if|else|for|each|in|try|error)\b/, "keyword"],
            [/\b(and|or|not|has)\b/, "operator"],
            [/\b(user\.(name|id|mention)|message\.content|channel\.name|server\.(name|members)|args|target)\b/, "variable"]
          ],
          string: [
            [/\{[^}]+\}/, "variable"],
            [/[^\\"]+/, "string"],
            [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }]
          ]
        }
      });
      monaco.languages.setLanguageConfiguration("newt", {
        comments: { lineComment: "#" },
        brackets: [["(", ")"], ["[", "]"]],
        autoClosingPairs: [{ open: "\"", close: "\"" }, { open: "(", close: ")" }, { open: "[", close: "]" }],
        indentationRules: {
          increaseIndentPattern: /:\s*(#.*)?$/
        }
      });
    }
  };

  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!monaco || !model) return;

    monaco.editor.setModelMarkers(model, "newt", errors.map((error) => ({
      severity: monaco.MarkerSeverity.Error,
      message: `${error.code}: ${error.message}${error.suggestion ? ` ${error.suggestion}` : ""}`,
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.line,
      endColumn: error.column + Math.max(1, error.length)
    })));
  }, [errors]);

  return (
    <MonacoReactEditor
      height="100%"
      defaultLanguage="newt"
      language="newt"
      theme="vs-dark"
      value={value}
      onMount={handleMount}
      onChange={(next: string | undefined) => onChange(next ?? "")}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        readOnly,
        tabSize: 4,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true
      }}
    />
  );
}
