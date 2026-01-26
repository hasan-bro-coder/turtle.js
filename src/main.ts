import "./style.css";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { run } from "../lang/run";
import Console from './console';

let startState = EditorState.create({
  doc: `forward 100\nright 90\nforward 100`,
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


document
  .querySelector<HTMLButtonElement>("#runBtn")
  ?.addEventListener("click", () => {
    const code = editor.state.doc.toString();
    run(code+"\n")
    console.log(code);
  });
