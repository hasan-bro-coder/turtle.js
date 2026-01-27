import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";

// 1. Define your custom turtle functions
const turtleCompletions = [
  // Movement
  { label: "forward", type: "function", info: "Moves the turtle forward by the specified distance." },
  { label: "backward", type: "function", info: "Moves the turtle backward." },
  { label: "right", type: "function", info: "Turns the turtle clockwise by degrees." },
  { label: "left", type: "function", info: "Turns the turtle counter-clockwise by degrees." },
  { label: "goto", type: "function", info: "Moves turtle to an absolute x, y position." },
  
  // Pen/Canvas
  { label: "penup", type: "function", info: "Lifts the pen so no lines are drawn." },
  { label: "pendown", type: "function", info: "Lowers the pen to start drawing." },
  { label: "pencolor", type: "function", info: "Sets the color of the pen (e.g., 'red' or '#ffffff')." },
  { label: "pensize", type: "function", info: "Sets the thickness of the line." },
  { label: "clear", type: "function", info: "Clears the canvas." },
  { label: "reset", type: "function", info: "Clears the canvas and resets the turtle to center." },
  
  // Keywords
  { label: "do", type: "keyword" },
  { label: "end", type: "keyword" },
  { label: "for", type: "keyword" },
  { label: "if", type: "keyword" },
  { label: "else", type: "keyword" },
];

// 2. Create the completion function
export function codeCompletions(context: CompletionContext): CompletionResult | null {
  // Find the word before the cursor
  let word = context.matchBefore(/\w*/);
  
  // If no word or empty, don't show anything unless explicitly triggered
  if (!word || (word.from == word.to && !context.explicit)) return null;

  return {
    from: word.from,
    options: turtleCompletions,
    // This filter ensures that as you type 'f', it shows 'forward'
    filter: true 
  };
}