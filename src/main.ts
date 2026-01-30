import "./style.css";
import { EditorState } from "@codemirror/state";
import { codeFolding } from "@codemirror/language";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { defaultKeymap } from "@codemirror/commands";
import { insertTab, indentLess } from "@codemirror/commands";
// import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import Console from "./console";
import {
  codeCompletions,
  turtleFoldService,
  turtleHighlight,
} from "./lang/editor/languge";
import { autocompletion } from "@codemirror/autocomplete";
import { turtle } from "./module";

const STORAGE_KEY = "turtle_js_code_autosave";
const getSavedCode = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY) ||
    `num_steps = 60
step_size = 5
turn_angle = 120


for i num_steps do
    forward step_size
    left turn_angle 
    step_size = step_size + 10
    wait 100
end

# DIHH EXAMPLE
# size = 7
# ballsize = 4

# up
# move 0,100
# down
# circle ballsize*10
# circle 0-(ballsize*10)
# up
# arc ballsize*10,90
# down
# left 90
# forward 20*size
# arc 0-(ballsize*10),-180
# forward 20*size
# hidepen`
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
  doc: getSavedCode(),
  extensions: [
    oneDark,
    keymap.of(defaultKeymap),
    basicSetup,
    turtleHighlight,
    codeFolding(),
    // foldGutter(),
    turtleFoldService,
    autocompletion({ override: [codeCompletions] }),
    autoSaveExtension,
    keymap.of([
      { key: "Tab", preventDefault: true, run: insertTab },
      { key: "Shift-Tab", preventDefault: true, run: indentLess },
    ]),
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

export const isMobile = () => {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return (
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase(),
    ) ||
    (isTouch && window.innerWidth <= 768)
  );
};

const symbols = ["#", "[", "]", ",", "(", ")", "=", "<", ">"];

const createToolbar = (view: EditorView) => {
  const bar = document.getElementById("mobile-toolbar")!;
  symbols.forEach((sym) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sym-btn";
    btn.textContent = sym;
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();

      const { main } = view.state.selection;
      view.dispatch({
        changes: { from: main.from, to: main.to, insert: sym },
        selection: { anchor: main.from + sym.length },
        scrollIntoView: true,
      });

      view.focus();
    });

    bar.appendChild(btn);
  });

  return bar;
};

if (isMobile()) {
  createToolbar(editor);
}

Console.initialize("console-output");
document.querySelector<HTMLDivElement>(".console-clear")!.onclick = () => {
  Console.clear();
};

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
    consoleBtn.textContent = "✖";
  } else {
    consoleBtn.textContent = "⌨";
  }
});
consoleHeader.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    consoleContainer.classList.remove("mobile-show");
    consoleBtn.textContent = "⌨";
  }
});

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

let run: (code: string) => void;

import("./lang/run").then((module) => {
  run = module.run;
});

async function runCode() {
  const code = editor.state.doc.toString();
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
