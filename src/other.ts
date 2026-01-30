import { EditorView } from "codemirror";
import Console from "./console";
import { editor } from "./main";

const consoleBtn = document.getElementById(
  "consoleToggleBtn",
) as HTMLButtonElement;
const consoleContainer = document.getElementById(
  "console-container",
) as HTMLDivElement;
const consoleHeader = document.querySelector(
  ".console-header",
) as HTMLDivElement;

Console.initialize("console-output");
document.querySelector<HTMLDivElement>(".console-clear")!.onclick = () => {
  Console.clear();
};


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
