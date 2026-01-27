import Environment from "../lang/back/env";
import { MK_NULL, RuntimeVal } from "../lang/back/values";
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
  .addBuilitinFunc("setx", 1, (args: RuntimeVal[]) => {
    turtle.setx((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("sety", 1, (args: RuntimeVal[]) => {
    turtle.sety((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("angle", 1, (args: RuntimeVal[]) => {
    turtle.setheading((args[0] as any).value);
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

  .addBuilitinFunc("penup", 0, () => {
    turtle.penup();
    return MK_NULL();
  })
  .addBuilitinFunc("pendown", 0, () => {
    turtle.pendown();
    return MK_NULL();
  })
  .addBuilitinFunc("size", 1, (args: RuntimeVal[]) => {
    turtle.pensize((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("pencolor", 1, (args: RuntimeVal[]) => {
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
  .addBuilitinFunc("begin_fill", 0, () => {
    turtle.begin_fill();
    return MK_NULL();
  })
  .addBuilitinFunc("end_fill", 0, () => {
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
  .addBuilitinFunc("hideturtle", 0, () => {
    turtle.hideturtle();
    return MK_NULL();
  })
  .addBuilitinFunc("showturtle", 0, () => {
    turtle.showturtle();
    return MK_NULL();
  })

  .addBuilitinFunc("print", 1, (args: RuntimeVal[]) => {
    //@ts-ignore
    Console.print(`${args[0].value} (${args[0].type})`);
    console.log(`${args[0].value} (${args[0].type})`);

    return MK_NULL();
  });

export const env = environment;
