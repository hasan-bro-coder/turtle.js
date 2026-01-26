import "./style.css";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { run } from "../lang/run";
import Console from './console';
import { turtle } from "./module";

let startState = EditorState.create({
  doc: 
`print "Hello, World"
forward 100
right 90
forward 100`,
  extensions: [
    oneDark,
    keymap.of(defaultKeymap),
    basicSetup,
    javascript(),
  ],
});
const editor = new EditorView({
  state: startState,
  parent: document.querySelector("#editor-container")!,
});

Console.initialize('console-output');
const canvas = document.getElementById("turtleCanvas") as HTMLCanvasElement;
function resize() {
  const parent = canvas.parentElement;
  if (!parent) {
    return;
  }
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;
}
window.addEventListener("resize", resize);
resize();



const consoleBtn = document.getElementById('consoleToggleBtn') as HTMLButtonElement;
const consoleContainer = document.getElementById('console-container') as HTMLDivElement;
const consoleHeader = document.querySelector('.console-header') as HTMLDivElement;


consoleBtn.addEventListener('click', () => {
  consoleContainer.classList.toggle('mobile-show');
  if (consoleContainer.classList.contains('mobile-show')) {
    consoleBtn.textContent = "✖ Close";
  } else {
    consoleBtn.textContent = "⌨ Console";
  }
});
consoleHeader.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    consoleContainer.classList.remove('mobile-show');
    consoleBtn.textContent = "⌨ Console";
  }
});


document
  .querySelector<HTMLButtonElement>("#runBtn")
  ?.addEventListener("click", () => {
    const code = editor.state.doc.toString();
    turtle.reset();
    run(code+"\n");
    console.log(code);
  });
