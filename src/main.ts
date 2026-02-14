import "./style.css";
import { EditorState } from "@codemirror/state";
import { codeFolding } from "@codemirror/language";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { defaultKeymap } from "@codemirror/commands";
import { insertTab, indentLess } from "@codemirror/commands";
// import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  // codeCompletions,
  turtleFoldService,
  turtleHighlight,
} from "./lang/editor/languge";
// import { autocompletion } from "@codemirror/autocomplete";
import { turtle } from "./module";

const STORAGE_KEY = "turtle_js_code_autosave";
const getSavedCode = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY) ||
    `# DIHH EXAMPLE
size = 7 
ballsize = 4

up
move 0,100
down
circle ballsize*10
circle 0-(ballsize*10)
up 
arc ballsize*10,90
down
right 90
forward 20*size
arc 0-(ballsize*10),180
forward 20*size
hidepen


# ACTUAL EXAMPLE
# num_steps = 60
# step_size = 5
# turn_angle = 120


# for i num_steps do
#     forward step_size
#     left turn_angle 
#     step_size = step_size + 10
#     wait 100
# end`
  );
};

function debounce(func: Function, wait: number) {
  let timeout: number | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}
const reloadAndRun = async () => {
  turtle.reset(); 
  try {
    runCode();
  } catch (err) {
  }
};

const debouncedReload = debounce(reloadAndRun, 500);

const autoSaveExtension = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const code = update.state.doc.toString();
    localStorage.setItem(STORAGE_KEY, code);
    console.log("Saved to local storage");
    return;
    debouncedReload();
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
    // autocompletion({ override: [codeCompletions] }),
    autoSaveExtension,
    keymap.of([
      { key: "Tab", preventDefault: true, run: insertTab },
      { key: "Shift-Tab", preventDefault: true, run: indentLess },
    ]),
  ],
});
export const editor = new EditorView({
  state: startState,
  parent: document.querySelector("#editor-container")!,
});



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
