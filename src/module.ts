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
  .addBuilitinFunc("forward", 1, async (args: Promise<RuntimeVal>[]) => {
    await turtle.forward((await args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("backward", 1, async (args: Promise<RuntimeVal>[]) => {
    await turtle.backward((await args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("right", 1, async (args: Promise<RuntimeVal>[]) => {
    await turtle.right((await args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("left", 1, async (args: Promise<RuntimeVal>[]) => {
    await turtle.left((await args[0] as any).value);
    return MK_NULL();
  })

  .addBuilitinFunc("goto", 2, async (args: Promise<RuntimeVal>[]) => {
    turtle.goto((await args[0] as any).value, (await args[1] as any).value);
    return MK_NULL();
  })
  // .addBuilitinFunc("move", 2, async (args: Promise<RuntimeVal>[]) => {
  //   turtle.move((await args[0] as any).value, (await args[1] as any).value);
  //   return MK_NULL();
  // })
  .addBuilitinFunc("setx", 1, async (args: Promise<RuntimeVal>[]) => {
    turtle.setx((await args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("sety", 1, async (args: Promise<RuntimeVal>[]) => {
    turtle.sety((await args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("angle", 1, async (args: Promise<RuntimeVal>[]) => {
    await turtle.angle((await args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("circle", 1, async (args: Promise<RuntimeVal>[]) => {
    await turtle.circle((await args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("semicircle", 1, async (args: Promise<RuntimeVal>[]) => {
    await turtle.circle((await args[0] as any).value, 180);
    return MK_NULL();
  })
  .addBuilitinFunc("arc", 2, async (args: Promise<RuntimeVal>[]) => {
    await turtle.circle((args[0] as any).value, (args[1] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("dot", 0, async () => {
    turtle.dot();
    return MK_NULL();
  })
  .addBuilitinFunc("pup", 0, async () => {
    turtle.penup();
    return MK_NULL();
  })
  .addBuilitinFunc("pdown", 0, async () => {
    turtle.pendown();
    return MK_NULL();
  })
  .addBuilitinFunc("size", 1, async (args: Promise<RuntimeVal>[]) => {
    turtle.pensize((await args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("color", 1, async (args: Promise<RuntimeVal>[]) => {
    turtle.pencolor((await args[0] as any).value);
    return MK_NULL();
  })
  // .addBuilitinFunc("fillcolor", 1, async (args: Promise<RuntimeVal>[]) => {
  //   turtle.fillcolor((await args[0] as any).value);
  //   return MK_NULL();
  // })
  .addBuilitinFunc("bfill", 0, async() => {
    turtle.begin_fill();
    return MK_NULL();
  })
  .addBuilitinFunc("efill", 0, async() => {
    turtle.end_fill();
    return MK_NULL();
  })

  .addBuilitinFunc("clear", 0, async() => {
    turtle.clear();
    return MK_NULL();
  })
  .addBuilitinFunc("reset", 0, async() => {
    turtle.reset();
    return MK_NULL();
  })
  .addBuilitinFunc("write", 1, async (args: Promise<RuntimeVal>[]) => {
    turtle.write(String((await args[0] as any).value));
    return MK_NULL();
  })
  .addBuilitinFunc("speed", 1, async (args: Promise<RuntimeVal>[]) => {
    turtle.setspeed((await args[0] as any).value);
    return MK_NULL();
  })

  // // Turtle visibility
  .addBuilitinFunc("hidepen", 0, async() => {
    turtle.hideturtle();
    return MK_NULL();
  })
  .addBuilitinFunc("showpen", 0, async() => {
    turtle.showturtle();
    return MK_NULL();
  })
  //math
  .addBuilitinFunc("rad", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: (((await args[0]) as any).value * Math.PI) / 180 };
  })
  .addBuilitinFunc("deg", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: (((await args[0]) as any).value * 180) / Math.PI };
  })
  .addBuilitinFunc("abs", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.abs((await args[0] as any).value) };
  })
  .addBuilitinFunc("sqrt", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.sqrt((await args[0] as any).value) };
  })
  .addBuilitinFunc("pow", 2, async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.pow((await args[0] as any).value, (await args[1] as any).value),
    };
  })
  .addBuilitinFunc("round", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.round((await args[0] as any).value) };
  })
  .addBuilitinFunc("floor", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.floor((await args[0] as any).value) };
  })
  .addBuilitinFunc("ceil", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.ceil((await args[0] as any).value) };
  })
  .addBuilitinFunc("sin", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.sin((await args[0] as any).value) };
  })
  .addBuilitinFunc("cos", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.cos((await args[0] as any).value) };
  })
  .addBuilitinFunc("tan", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.tan((await args[0] as any).value) };
  })
  .addBuilitinFunc("asin", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.asin((await args[0] as any).value) };
  })
  .addBuilitinFunc("acos", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.acos((await args[0] as any).value) };
  })
  .addBuilitinFunc("atan", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "number", value: Math.atan((await args[0] as any).value) };
  })
  .addBuilitinFunc("max", 2, async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.max((await args[0] as any).value, (await args[1] as any).value),
    };
  })
  .addBuilitinFunc("min", 2, async (args: Promise<RuntimeVal>[]) => {
    return {
      type: "number",
      value: Math.min((await args[0] as any).value, (await args[1] as any).value),
    };
  })
  .addBuilitinFunc("random", 0, async() => {
    // Returns a float between 0 and 1
    return { type: "number", value: Math.random() };
  })
  .addBuilitinFunc("randint", 2, async (args: Promise<RuntimeVal>[]) => {
    const min = (await args[0] as any).value;
    const max = (await args[1] as any).value;
    return {
      type: "number",
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    };
  })

  .addBuilitinFunc("now", 0, async() => {
    // Current timestamp in milliseconds
    return { type: "number", value: Date.now() };
  })
  .addBuilitinFunc("time", 0, async() => {
    // Current time in seconds (common in Python/Unix)
    return { type: "number", value: Date.now() / 1000 };
  })

  // --- Utility Functions ---
  .addBuilitinFunc("wait", 1, async (args: Promise<RuntimeVal>[]) => {
    const ms = (await args[0] as any).value;
    await new Promise(resolve => setTimeout(resolve, ms));
    
    return MK_NULL();
  })
  .addBuilitinFunc("type", 1, async (args: Promise<RuntimeVal>[]) => {
    return { type: "string", value: (await args[0]).type };
  })

.addBuilitinFunc("print", 5, async (args: Promise<RuntimeVal>[]) => {
    // 1. Resolve all promises in the args array
    const resolvedArgs = await Promise.all(args);
    
    // 2. Map the values to strings and join them with a space
    const output = resolvedArgs
        .map(arg => String((arg as any).value))
        .join(" ");

    // 3. Output to your custom Console and the browser console
    //@ts-ignore
    Console.print(output);
    console.log(output);

    return MK_NULL();
});

environment.declareVar("PI", MK_NUMBER(Math.PI));

export const env = environment;
