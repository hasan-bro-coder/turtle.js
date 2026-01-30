import Environment from "./lang/back/env";
import {
  MK_NULL,
  MK_NUMBER,
  NumberVal,
  RuntimeVal,
  StringVal,
} from "./lang/back/values";
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
  .addBuilitinFunc("forward", async (args: Promise<RuntimeVal>[]) => {
    await turtle.forward(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })
  .addBuilitinFunc("backward", async (args: Promise<RuntimeVal>[]) => {
    await turtle.backward(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })
  .addBuilitinFunc("right", async (args: Promise<RuntimeVal>[]) => {
    await turtle.right(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })
  .addBuilitinFunc("left", async (args: Promise<RuntimeVal>[]) => {
    await turtle.left(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })

  .addBuilitinFunc("goto", async (args: Promise<RuntimeVal>[]) => {
    turtle.goto(
      ((await args[0]) as NumberVal).value,
      ((await args[1]) as NumberVal).value,
    );
    return MK_NULL();
  })
  .addBuilitinFunc("move", async (args: Promise<RuntimeVal>[]) => {
    turtle.moveTo(
      ((await args[0]) as NumberVal).value,
      ((await args[1]) as NumberVal).value,
    );
    return MK_NULL();
  })
  .addBuilitinFunc("setx", async (args: Promise<RuntimeVal>[]) => {
    turtle.setx(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })
  .addBuilitinFunc("sety", async (args: Promise<RuntimeVal>[]) => {
    turtle.sety(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })
  .addBuilitinFunc("getx", async () => {
    return MK_NUMBER(turtle.state.x);
  })
  .addBuilitinFunc("gety", async () => {
    return MK_NUMBER(turtle.state.y);
  })
  .addBuilitinFunc("width", async () => {
    return MK_NUMBER(turtle.drawCanvas.width);
  })
  .addBuilitinFunc("height", async () => {
    return MK_NUMBER(turtle.drawCanvas.height);
  })
  .addBuilitinFunc("angle", async (args: Promise<RuntimeVal>[]) => {
    await turtle.angle(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })
  .addBuilitinFunc("circle", async (args: Promise<RuntimeVal>[]) => {
    await turtle.circle(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })
  .addBuilitinFunc("arc", async (args: Promise<RuntimeVal>[]) => {
    await turtle.circle(
      ((await args[0]) as NumberVal).value,
      ((await args[1]) as NumberVal).value,
    );
    return MK_NULL();
  })
  .addBuilitinFunc("dot", async () => {
    turtle.dot();
    return MK_NULL();
  })
  .addBuilitinFunc("up", async () => {
    turtle.penup();
    return MK_NULL();
  })
  .addBuilitinFunc("down", async () => {
    turtle.pendown();
    return MK_NULL();
  })
  .addBuilitinFunc("size", async (args: Promise<RuntimeVal>[]) => {
    turtle.pensize(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })
  .addBuilitinFunc("color", async (args: Promise<RuntimeVal>[]) => {
    if (args.length === 1) {
      const colorVal = ((await args[0]) as StringVal).value;
      turtle.pencolor(colorVal);
    } else if (args.length === 3) {
      const r = ((await args[0]) as NumberVal).value;
      const g = ((await args[1]) as NumberVal).value;
      const b = ((await args[2]) as NumberVal).value;
      const rgbString = `rgb(${r}, ${g}, ${b})`;
      turtle.pencolor(rgbString);
    } else {
      throw new Error(
        `Function 'color' expected 1 or 3 arguments, but got ${args.length}.`,
      );
    }

    return MK_NULL();
  })
  // .addBuilitinFunc("fillcolor", async (args: Promise<RuntimeVal>[]) => {
  //   turtle.fillcolor((await args[0] as any).value);
  //   return MK_NULL();
  // })
  .addBuilitinFunc("bfill", async () => {
    turtle.begin_fill();
    return MK_NULL();
  })
  .addBuilitinFunc("efill", async () => {
    turtle.end_fill();
    return MK_NULL();
  })

  .addBuilitinFunc("clear", async () => {
    turtle.clear();
    return MK_NULL();
  })
  .addBuilitinFunc("reset", async () => {
    turtle.reset();
    return MK_NULL();
  })
  .addBuilitinFunc("write", async (args: Promise<RuntimeVal>[]) => {
    turtle.write(String(((await args[0]) as StringVal).value));
    return MK_NULL();
  })
  .addBuilitinFunc("speed", async (args: Promise<RuntimeVal>[]) => {
    turtle.setspeed(((await args[0]) as NumberVal).value);
    return MK_NULL();
  })

  // // Turtle visibility
  .addBuilitinFunc("hidepen", async () => {
    turtle.hideturtle();
    return MK_NULL();
  })
  .addBuilitinFunc("showpen", async () => {
    turtle.showturtle();
    return MK_NULL();
  })
  //math
  .addBuilitinFunc("rad", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: (((await args[0]) as NumberVal).value * Math.PI) / 180,
    };
  })
  .addBuilitinFunc("deg", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: (((await args[0]) as NumberVal).value * 180) / Math.PI,
    };
  })
  .addBuilitinFunc("abs", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.abs(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("sqrt", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.sqrt(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("pow", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.pow(
        ((await args[0]) as NumberVal).value,
        ((await args[1]) as NumberVal).value,
      ),
    };
  })
  .addBuilitinFunc("round", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.round(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("floor", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.floor(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("ceil", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.ceil(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("sin", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.sin(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("cos", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.cos(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("tan", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.tan(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("asin", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.asin(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("acos", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.acos(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("atan", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.atan(((await args[0]) as NumberVal).value),
    };
  })
  .addBuilitinFunc("max", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.max(
        ((await args[0]) as NumberVal).value,
        ((await args[1]) as NumberVal).value,
      ),
    };
  })
  .addBuilitinFunc("min", async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.min(
        ((await args[0]) as NumberVal).value,
        ((await args[1]) as NumberVal).value,
      ),
    };
  })
  .addBuilitinFunc("random", async () => {
    // Returns a float between 0 and 1
    return { type: "number", value: Math.random() };
  })
  .addBuilitinFunc("randint", async (args: Promise<RuntimeVal>[]) => {
    const min = ((await args[0]) as NumberVal).value;
    const max = ((await args[1]) as NumberVal).value;
    return {
      type: "number",
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    };
  })

  .addBuilitinFunc("now", async () => {
    // Current timestamp in milliseconds
    return { type: "number", value: Date.now() };
  })
  .addBuilitinFunc("time", async () => {
    // Current time in seconds (common in Python/Unix)
    return { type: "number", value: Date.now() / 1000 };
  })

  // --- Utility Functions ---
  .addBuilitinFunc("wait", async (args: Promise<RuntimeVal>[]) => {
    const ms = ((await args[0]) as NumberVal).value;
    await new Promise((resolve) => setTimeout(resolve, ms));

    return MK_NULL();
  })
  .addBuilitinFunc("type", async (args: Promise<RuntimeVal>[]) => {
    return { type: "string", value: (await args[0]).type };
  })

  .addBuilitinFunc("print", async (args: Promise<RuntimeVal>[]) => {
    const resolvedArgs = await Promise.all(args);
    const output = resolvedArgs
      .map((arg) => String((arg as any).value))
      .join(" ");
    //@ts-ignore
    Console.print(output);
    console.log(output);
    return MK_NULL();
  });

environment.declareVar("PI", MK_NUMBER(Math.PI));

export const env = environment;
