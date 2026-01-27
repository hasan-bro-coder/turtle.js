import Environment from "./lang/back/env";
import { MK_NULL, MK_NUMBER, RuntimeVal } from "./lang/back/values";
import { TurtleCanvas } from "./canvas";
import Console from "./console";

const drawCanvasEl = document.getElementById(
  "turtleCanvas",
) as HTMLCanvasElement;
const cursorCanvasEl = document.getElementById(
  "turtleCursorCanvas",
) as HTMLCanvasElement;
export const turtle = new TurtleCanvas(drawCanvasEl, cursorCanvasEl);

const environment = new Environment();

environment
  // Basic movement
  .addBuilitinFunc("forward", 1, (args: RuntimeVal[]) => {
    turtle.forward((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("backward", 1, (args: RuntimeVal[]) => {
    turtle.backward((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("right", 1, (args: RuntimeVal[]) => {
    turtle.right((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("left", 1, (args: RuntimeVal[]) => {
    turtle.left((args[0] as any).value);
    return MK_NULL();
  })

  // Position control
  .addBuilitinFunc("goto", 2, (args: RuntimeVal[]) => {
    turtle.goto((args[0] as any).value, (args[1] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("move", 2, (args: RuntimeVal[]) => {
    turtle.move((args[0] as any).value, (args[1] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("setx", 1, (args: RuntimeVal[]) => {
    turtle.setx((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("sety", 1, (args: RuntimeVal[]) => {
    turtle.sety((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("angle", 1, (args: RuntimeVal[]) => {
    turtle.angle((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("home", 0, () => {
    turtle.home();
    return MK_NULL();
  })
  .addBuilitinFunc("circle", 1, (args: RuntimeVal[]) => {
    turtle.circle((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("semicircle", 1, (args: RuntimeVal[]) => {
    turtle.circle((args[0] as any).value, 180);
    return MK_NULL();
  })
  .addBuilitinFunc("arc", 2, (args: RuntimeVal[]) => {
    turtle.circle((args[0] as any).value, (args[1] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("dot", 0, () => {
    turtle.dot();
    return MK_NULL();
  })
  .addBuilitinFunc("stamp", 0, () => {
    turtle.stamp();
    return MK_NULL();
  })

  .addBuilitinFunc("pup", 0, () => {
    turtle.penup();
    return MK_NULL();
  })
  .addBuilitinFunc("pdown", 0, () => {
    turtle.pendown();
    return MK_NULL();
  })
  .addBuilitinFunc("size", 1, (args: RuntimeVal[]) => {
    turtle.pensize((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("pcolor", 1, (args: RuntimeVal[]) => {
    turtle.pencolor((args[0] as any).value);
    return MK_NULL();
  })

  .addBuilitinFunc("fillcolor", 1, (args: RuntimeVal[]) => {
    turtle.fillcolor((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("color", 1, (args: RuntimeVal[]) => {
    turtle.color((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("bfill", 0, () => {
    turtle.begin_fill();
    return MK_NULL();
  })
  .addBuilitinFunc("efill", 0, () => {
    turtle.end_fill();
    return MK_NULL();
  })

  // Canvas control
  .addBuilitinFunc("clear", 0, () => {
    turtle.clear();
    return MK_NULL();
  })
  .addBuilitinFunc("reset", 0, () => {
    turtle.reset();
    return MK_NULL();
  })

  .addBuilitinFunc("write", 1, (args: RuntimeVal[]) => {
    turtle.write(String((args[0] as any).value));
    return MK_NULL();
  })

  // Speed control
  .addBuilitinFunc("speed", 1, (args: RuntimeVal[]) => {
    turtle.speed((args[0] as any).value);
    return MK_NULL();
  })

  // Turtle visibility
  .addBuilitinFunc("hidepen", 0, () => {
    turtle.hideturtle();
    return MK_NULL();
  })
  .addBuilitinFunc("showpen", 0, () => {
    turtle.showturtle();
    return MK_NULL();
  })
  //math
  .addBuilitinFunc("rad", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: ((args[0] as any).value * Math.PI) / 180 };
  })
  .addBuilitinFunc("deg", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: ((args[0] as any).value * 180) / Math.PI };
  })
  .addBuilitinFunc("abs", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.abs((args[0] as any).value) };
  })
  .addBuilitinFunc("sqrt", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.sqrt((args[0] as any).value) };
  })
  .addBuilitinFunc("pow", 2, (args: RuntimeVal[]) => {
    return {
      type: "number",
      value: Math.pow((args[0] as any).value, (args[1] as any).value),
    };
  })
  .addBuilitinFunc("round", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.round((args[0] as any).value) };
  })
  .addBuilitinFunc("floor", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.floor((args[0] as any).value) };
  })
  .addBuilitinFunc("ceil", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.ceil((args[0] as any).value) };
  })
  .addBuilitinFunc("sin", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.sin((args[0] as any).value) };
  })
  .addBuilitinFunc("cos", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.cos((args[0] as any).value) };
  })
  .addBuilitinFunc("tan", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.tan((args[0] as any).value) };
  })
  .addBuilitinFunc("asin", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.asin((args[0] as any).value) };
  })
  .addBuilitinFunc("acos", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.acos((args[0] as any).value) };
  })
  .addBuilitinFunc("atan", 1, (args: RuntimeVal[]) => {
    return { type: "number", value: Math.atan((args[0] as any).value) };
  })
  .addBuilitinFunc("max", 2, (args: RuntimeVal[]) => {
    return {
      type: "number",
      value: Math.max((args[0] as any).value, (args[1] as any).value),
    };
  })
  .addBuilitinFunc("min", 2, (args: RuntimeVal[]) => {
    return {
      type: "number",
      value: Math.min((args[0] as any).value, (args[1] as any).value),
    };
  })
  .addBuilitinFunc("random", 0, () => {
    // Returns a float between 0 and 1
    return { type: "number", value: Math.random() };
  })
  .addBuilitinFunc("randint", 2, (args: RuntimeVal[]) => {
    // Returns an integer between min and max (inclusive)
    const min = (args[0] as any).value;
    const max = (args[1] as any).value;
    return {
      type: "number",
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    };
  })

  .addBuilitinFunc("now", 0, () => {
    // Current timestamp in milliseconds
    return { type: "number", value: Date.now() };
  })
  .addBuilitinFunc("time", 0, () => {
    // Current time in seconds (common in Python/Unix)
    return { type: "number", value: Date.now() / 1000 };
  })

  // --- Utility Functions ---
  .addBuilitinFunc("wait", 1, (args: RuntimeVal[]) => {
    // Note: This is tricky in a synchronous interpreter.
    // It works best if your evaluator is async.
    const ms = (args[0] as any).value;
    const start = Date.now();
    while (Date.now() - start < ms) {
      /* Sync block - use with caution */
    }
    return MK_NULL();
  })
  .addBuilitinFunc("type", 1, (args: RuntimeVal[]) => {
    // Returns the type name as a string
    return { type: "string", value: args[0].type };
  })

  .addBuilitinFunc("print", 1, (args: RuntimeVal[]) => {
    //@ts-ignore
    Console.print(`${args[0].value} (${args[0].type})`);
    console.log(`${args[0].value} (${args[0].type})`);

    return MK_NULL();
  });

environment.declareVar("PI", MK_NUMBER(Math.PI));

export const env = environment;
