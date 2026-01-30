import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { foldService, StreamLanguage } from "@codemirror/language"

const turtleCompletions = [
  { label: "forward", type: "function", info: "Moves the turtle forward by the specified distance." },
  { label: "backward", type: "function", info: "Moves the turtle backward by the specified distance." },
  { label: "right", type: "function", info: "Turns the turtle clockwise by degrees." },
  { label: "left", type: "function", info: "Turns the turtle counter-clockwise by degrees." },
  { label: "goto", type: "function", info: "Moves turtle to an absolute x, y position." },
  { label: "move", type: "function", info: "Moves turtle relative to current position by x, y." },
  { label: "setx", type: "function", info: "Sets the turtle's x coordinate." },
  { label: "sety", type: "function", info: "Sets the turtle's y coordinate." },
  { label: "angle", type: "function", info: "Sets the turtle's heading to an absolute angle." },
  
  { label: "getx", type: "function", info: "Returns the current x coordinate." },
  { label: "gety", type: "function", info: "Returns the current y coordinate." },
  { label: "width", type: "function", info: "Returns the canvas width." },
  { label: "height", type: "function", info: "Returns the canvas height." },
  
  { label: "up", type: "function", info: "Lifts the pen so no lines are drawn." },
  { label: "down", type: "function", info: "Lowers the pen to start drawing." },
  { label: "hidepen", type: "function", info: "Hides the turtle cursor." },
  { label: "showpen", type: "function", info: "Shows the turtle cursor." },
  { label: "size", type: "function", info: "Sets the thickness of the line." },
  { label: "color", type: "function", info: "Sets the pen color (RGB values or color name/hex)." },
  { label: "speed", type: "function", info: "Sets the drawing speed (-1 for instant)." },
  
  { label: "circle", type: "function", info: "Draws a circle with the specified radius." },
  { label: "arc", type: "function", info: "Draws an arc with specified radius and extent angle." },
  { label: "dot", type: "function", info: "Draws a dot at the current position." },
  { label: "bfill", type: "function", info: "Begins filling a shape." },
  { label: "efill", type: "function", info: "Ends filling and fills the shape." },
  
  { label: "clear", type: "function", info: "Clears the canvas." },
  { label: "reset", type: "function", info: "Clears the canvas and resets the turtle to center." },
  { label: "write", type: "function", info: "Writes text at the current position." },
  
  { label: "sin", type: "function", info: "Returns the sine of a number (radians)." },
  { label: "cos", type: "function", info: "Returns the cosine of a number (radians)." },
  { label: "tan", type: "function", info: "Returns the tangent of a number (radians)." },
  { label: "asin", type: "function", info: "Returns the arcsine of a number." },
  { label: "acos", type: "function", info: "Returns the arccosine of a number." },
  { label: "atan", type: "function", info: "Returns the arctangent of a number." },
  
  { label: "rad", type: "function", info: "Converts degrees to radians." },
  { label: "deg", type: "function", info: "Converts radians to degrees." },
  
  { label: "abs", type: "function", info: "Returns the absolute value of a number." },
  { label: "sqrt", type: "function", info: "Returns the square root of a number." },
  { label: "pow", type: "function", info: "Returns base raised to the exponent power." },
  { label: "round", type: "function", info: "Rounds a number to the nearest integer." },
  { label: "floor", type: "function", info: "Rounds a number down to the nearest integer." },
  { label: "ceil", type: "function", info: "Rounds a number up to the nearest integer." },
  { label: "max", type: "function", info: "Returns the largest of two numbers." },
  { label: "min", type: "function", info: "Returns the smallest of two numbers." },
  
  { label: "random", type: "function", info: "Returns a random float between 0 and 1." },
  { label: "randint", type: "function", info: "Returns a random integer between min and max (inclusive)." },
  
  { label: "now", type: "function", info: "Returns the current timestamp in milliseconds." },
  { label: "time", type: "function", info: "Returns the current time in seconds." },
  { label: "wait", type: "function", info: "Pauses execution for the specified milliseconds." },
  
  { label: "type", type: "function", info: "Returns the type of a value." },
  { label: "print", type: "function", info: "Prints output to the console." },
  
  { label: "PI", type: "constant", info: "The mathematical constant π (3.14159...)." },
  
  { label: "do", type: "keyword", info: "Begins a block (for, if, loop, function)." },
  { label: "end", type: "keyword", info: "Ends a block." },
  { label: "for", type: "keyword", info: "Starts a for loop." },
  { label: "loop", type: "keyword", info: "Starts a while loop." },
  { label: "if", type: "keyword", info: "Starts a conditional statement." },
  { label: "else", type: "keyword", info: "Provides an alternative branch in conditionals." },
  { label: "fn", type: "keyword", info: "Defines a function." },
  { label: "true", type: "keyword", info: "Boolean true value." },
  { label: "false", type: "keyword", info: "Boolean false value." },
];

export function codeCompletions(context: CompletionContext): CompletionResult | null {
  let word = context.matchBefore(/\w*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: turtleCompletions,
    filter: true 
  };
}
const turtleLanguage = {
  name: "turtle",
  
  startState: function() {
    return {
      inString: false,
      stringChar: null
    };
  },
  
  token: function(stream:any, state:any) {
    if (state.inString) {
      if (stream.match(state.stringChar)) {
        state.inString = false;
        state.stringChar = null;
        return "string";
      }
      stream.next();
      return "string";
    }
    if (stream.match('"') || stream.match("'")) {
      state.inString = true;
      state.stringChar = stream.current();
      return "string";
    }
    if (stream.match("#")) {
      stream.skipToEnd();
      return "comment";
    }
    if (stream.eatSpace()) {
      return null;
    }
    if (stream.match(/^(if|else|for|loop|do|end|fn)\b/)) {
      return "keyword";
    }
    if (stream.match(/^(true|false)\b/)) {
      return "bool";
    }
    if (stream.match(/^-?\d+\.?\d*/)) {
      return "number";
    }
    if (stream.match(/^(==|!=|<=|>=|&&|\|\||[+\-*/<>=&|!])/)) {
      return "operator";
    }
    if (stream.match(/^[(),\[\]]/)) {
      return "punctuation";
    }
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      return "variableName";
    }
    stream.next();
    return null;
  },
  
  languageData: {
    commentTokens: { line: "#" },
    closeBrackets: { brackets: ["(", "[", '"', "'"] }
  }
};

export const turtleHighlight = StreamLanguage.define(turtleLanguage);


export const turtleFoldService = foldService.of((state, lineStart, _) => {
  const line = state.doc.lineAt(lineStart).text;
  
  if (line.includes("do") && !line.includes("end")) {
    let count = 1;
    let endLine = -1;
    for (let i = state.doc.lineAt(lineStart).number + 1; i <= state.doc.lines; i++) {
      const nextLine = state.doc.line(i).text;
      if (nextLine.includes("do")) count++;
      if (nextLine.includes("end")) count--;

      if (count === 0) {
        endLine = i;
        break;
      }
    }
    if (endLine !== -1) {
      return {
        from: state.doc.lineAt(lineStart).to,
        to: state.doc.line(endLine).from
      };
    }
  }
  return null;
});