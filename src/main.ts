import "./style.css";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { defaultKeymap } from "@codemirror/commands";
// import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import Console from "./console";
import { codeCompletions } from "./lang/editor/autocomplete";
import { autocompletion } from "@codemirror/autocomplete";
import { turtle } from "./module";

// import { TurtleCanvas } from "./canvas";

const STORAGE_KEY = "turtle_js_code_autosave";
const getSavedCode = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY) || `forward 100\nright 90\nforward 100`
  );
};
const autoSaveExtension = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const code = update.state.doc.toString();
    localStorage.setItem(STORAGE_KEY, code);
    console.log("Saved to local storage");
  }
});

let startState = EditorState.create({
  doc:
    getSavedCode() ||
    `loop true do
    hidepen
    base = [randint 10,150]
    adj = [randint 10,150]
    hype = [sqrt ([pow base,2] + [pow adj,2])]
    right 90
    forward base
    left 90
    forward adj
    left 180-[deg [atan base / adj]]
    forward hype
    wait 1000
    reset
end `,
  extensions: [
    oneDark,
    keymap.of(defaultKeymap),
    basicSetup,
    python(),
    autocompletion({ override: [codeCompletions] }),
    autoSaveExtension,
  ],
});
const editor = new EditorView({
  state: startState,
  parent: document.querySelector("#editor-container")!,
});

const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;
const importBtn = document.getElementById("importBtn") as HTMLButtonElement;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
exportBtn.addEventListener("click", () => {
  const code = editor.state.doc.toString();
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = "my_turtle_art.turtle";
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
  console.log("Code exported successfully");
});

importBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;

    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: content,
      },
    });

    console.log("Code imported successfully");
    target.value = "";
  };

  reader.readAsText(file);
});

Console.initialize("console-output");
const canvas = document.getElementById("turtleCanvas") as HTMLCanvasElement;
const cursorCanvas = document.getElementById(
  "turtleCursorCanvas",
) as HTMLCanvasElement;

function resize() {
  const parent = canvas.parentElement;
  if (!parent) {
    return;
  }
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;
  cursorCanvas.width = parent.clientWidth;
  cursorCanvas.height = parent.clientHeight;
}
window.addEventListener("resize", resize);
resize();

const consoleBtn = document.getElementById(
  "consoleToggleBtn",
) as HTMLButtonElement;
const consoleContainer = document.getElementById(
  "console-container",
) as HTMLDivElement;
const consoleHeader = document.querySelector(
  ".console-header",
) as HTMLDivElement;

consoleBtn.addEventListener("click", () => {
  consoleContainer.classList.toggle("mobile-show");
  if (consoleContainer.classList.contains("mobile-show")) {
    consoleBtn.textContent = "✖ Close";
  } else {
    consoleBtn.textContent = "⌨ Console";
  }
});
consoleHeader.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    consoleContainer.classList.remove("mobile-show");
    consoleBtn.textContent = "⌨ Console";
  }
});

let run: (code: string) => void;

import("./lang/run").then((module) => {
  run = module.run;
});

async function runCode() {
  const code = editor.state.doc.toString();
  // await TurtleCanvas.reset();
  turtle.reset();
  run(code + "\n");
  // console.log(code);
}

document
  .querySelector<HTMLButtonElement>("#runBtn")
  ?.addEventListener("click", () => {
    runCode();
  });

window.addEventListener("keydown", (event) => {
  if (event.altKey && event.key === "r") {
    runCode();
  }
});
