// import Environment from "../lang/back/env";
// import { MK_NULL, RuntimeVal } from "../lang/back/values";
// import Console from "./console";

// export class TurtleCanvas {
//     private ctx: CanvasRenderingContext2D;
//     private cursorCtx: CanvasRenderingContext2D; // For the turtle icon
    
//     // Internal State
//     private x = 0;
//     private y = 0;
//     private angle = -Math.PI / 2;
//     private penDown = true;
//     private penColor = "white";
//     private penSize = 2;
//     private fillColor = "white";

//     // Animation Queue
//     private queue: any[] = [];
//     private currentTask: any = null;
//     private speed = 5; // Pixels or degrees per frame

//     constructor(canvas: HTMLCanvasElement) {
//         this.ctx = canvas.getContext("2d")!;
        
//         // Create an overlay canvas for the cursor
//         const cursorCanvas = canvas.cloneNode() as HTMLCanvasElement;
//         cursorCanvas.id = "turtleCursor";
//         cursorCanvas.style.position = "absolute";
//         cursorCanvas.style.pointerEvents = "none";
//         canvas.parentElement!.appendChild(cursorCanvas);
//         this.cursorCtx = cursorCanvas.getContext("2d")!;

//         this.reset();
//         this.startAnimationLoop();
//     }

//     private startAnimationLoop() {
//         const loop = () => {
//             this.update();
//             this.drawCursor();
//             requestAnimationFrame(loop);
//         };
//         requestAnimationFrame(loop);
//     }

//     private update() {
//         if (!this.currentTask && this.queue.length > 0) {
//             this.currentTask = this.queue.shift();
//         }

//         if (!this.currentTask) return;

//         const task = this.currentTask;
//         switch (task.type) {
//             case "MOVE":
//                 this.stepMove(task);
//                 break;
//             case "ROTATE":
//                 this.stepRotate(task);
//                 break;
//             default:
//                 // Instant commands (pencolor, clear, etc.)
//                 task.fn();
//                 this.currentTask = null;
//         }
//     }

//     private stepMove(task: any) {
//         const remaining = task.distance;
//         const move = Math.min(this.speed, Math.abs(remaining)) * Math.sign(remaining);
        
//         const nextX = this.x + Math.cos(this.angle) * move;
//         const nextY = this.y + Math.sin(this.angle) * move;

//         if (this.penDown) {
//             this.ctx.beginPath();
//             this.ctx.lineWidth = this.penSize;
//             this.ctx.strokeStyle = this.penColor;
//             this.ctx.moveTo(this.x, this.y);
//             this.ctx.lineTo(nextX, nextY);
//             this.ctx.stroke();
//         }

//         this.x = nextX;
//         this.y = nextY;
//         task.distance -= move;

//         if (Math.abs(task.distance) < 0.1) this.currentTask = null;
//     }

//     private stepRotate(task: any) {
//         const remaining = task.degrees;
//         const rotate = Math.min(this.speed, Math.abs(remaining)) * Math.sign(remaining);
        
//         this.angle += (rotate * Math.PI) / 180;
//         task.degrees -= rotate;

//         if (Math.abs(task.degrees) < 0.1) this.currentTask = null;
//     }

//     private drawCursor() {
//         this.cursorCtx.clearRect(0, 0, this.cursorCtx.canvas.width, this.cursorCtx.canvas.height);
//         const size = 12;
//         this.cursorCtx.save();
//         this.cursorCtx.translate(this.x, this.y);
//         this.cursorCtx.rotate(this.angle + Math.PI / 2);
        
//         this.cursorCtx.fillStyle = "#e5c07b"; // Accent color
//         this.cursorCtx.beginPath();
//         this.cursorCtx.moveTo(0, -size);
//         this.cursorCtx.lineTo(-size/1.5, size/1.5);
//         this.cursorCtx.lineTo(size/1.5, size/1.5);
//         this.cursorCtx.closePath();
//         this.cursorCtx.fill();
//         this.cursorCtx.restore();
//     }

//     // --- Overridden Methods to use Queue ---
//     forward(dist: number) {console.log(this.queue);
//      this.queue.push({ type: "MOVE", distance: dist }); }
//     backward(dist: number) { this.queue.push({ type: "MOVE", distance: -dist }); }
//     right(deg: number) { this.queue.push({ type: "ROTATE", degrees: deg }); }
//     left(deg: number) { this.queue.push({ type: "ROTATE", degrees: -deg }); }
    
//     // For instant things, wrap them in a function task
//     pencolor(c: string) { this.queue.push({ type: "INSTANT", fn: () => this.penColor = c }); }
//     clear() { this.queue.push({ type: "INSTANT", fn: () => {
//         this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
//     }}); }

//     reset() {
//         this.queue = [];
//         this.currentTask = null;
//         this.x = this.ctx.canvas.width / 2;
//         this.y = this.ctx.canvas.height / 2;
//         this.angle = -Math.PI / 2;
//         this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
//     }
// }
// const canvasEl = document.getElementById('turtleCanvas') as HTMLCanvasElement;
// export const turtle = new TurtleCanvas(canvasEl);

// const environment = new Environment();

// environment
//   // Basic movement
//   .addBuilitinFunc("forward", 1, (args: RuntimeVal[]) => {
//     turtle.forward((args[0] as any).value);
//     return MK_NULL();
//   })
//   .addBuilitinFunc("backward", 1, (args: RuntimeVal[]) => {
//     turtle.backward((args[0] as any).value);
//     return MK_NULL();
//   })
//   .addBuilitinFunc("right", 1, (args: RuntimeVal[]) => {
//     turtle.right((args[0] as any).value);
//     return MK_NULL();
//   })
//   .addBuilitinFunc("left", 1, (args: RuntimeVal[]) => {
//     turtle.left((args[0] as any).value);
//     return MK_NULL();
//   })
  
// //   // Position control
// //   .addBuilitinFunc("goto", 2, (args: RuntimeVal[]) => {
// //     turtle.goto((args[0] as any).value, (args[1] as any).value);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("setx", 1, (args: RuntimeVal[]) => {
// //     turtle.setx((args[0] as any).value);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("sety", 1, (args: RuntimeVal[]) => {
// //     turtle.sety((args[0] as any).value);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("setheading", 1, (args: RuntimeVal[]) => {
// //     turtle.setheading((args[0] as any).value);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("home", 0, () => {
// //     turtle.home();
// //     return MK_NULL();
// //   })
  
// //   // Drawing
// //   .addBuilitinFunc("circle", 1, (args: RuntimeVal[]) => {
// //     turtle.circle((args[0] as any).value);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("semicircle", 1, (args: RuntimeVal[]) => {
// //     turtle.circle((args[0] as any).value, 180);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("arc", 2, (args: RuntimeVal[]) => {
// //     turtle.circle((args[0] as any).value, (args[1] as any).value);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("dot", 0, () => {
// //     turtle.dot();
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("stamp", 0, () => {
// //     turtle.stamp();
// //     return MK_NULL();
// //   })
  
//   // Pen control
// //   .addBuilitinFunc("penup", 0, () => {
// //     turtle.penup();
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("pendown", 0, () => {
// //     turtle.pendown();
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("pensize", 1, (args: RuntimeVal[]) => {
// //     turtle.pensize((args[0] as any).value);
// //     return MK_NULL();
// //   })
//   .addBuilitinFunc("pencolor", 1, (args: RuntimeVal[]) => {
//     turtle.pencolor((args[0] as any).value);
//     return MK_NULL();
//   })
  
//   // Color control
// //   .addBuilitinFunc("fillcolor", 1, (args: RuntimeVal[]) => {
// //     turtle.fillcolor((args[0] as any).value);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("color", 1, (args: RuntimeVal[]) => {
// //     turtle.color((args[0] as any).value);
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("begin_fill", 0, () => {
// //     turtle.begin_fill();
// //     return MK_NULL();
// //   })
// //   .addBuilitinFunc("end_fill", 0, () => {
// //     turtle.end_fill();
// //     return MK_NULL();
// //   })
  
//   // Canvas control
//   .addBuilitinFunc("clear", 0, () => {
//     turtle.clear();
//     return MK_NULL();
//   })
//   .addBuilitinFunc("reset", 0, () => {
//     turtle.reset();
//     return MK_NULL();
//   })
  
//   // Text
// //   .addBuilitinFunc("write", 1, (args: RuntimeVal[]) => {
// //     turtle.write(String((args[0] as any).value));
// //     return MK_NULL();
// //   })
  
//   // State queries
// //   .addBuilitinFunc("xcor", 0, () => {
// //     return { type: "number", value: turtle.position()[0] } as RuntimeVal;
// //   })
// //   .addBuilitinFunc("ycor", 0, () => {
// //     return { type: "number", value: turtle.position()[1] } as RuntimeVal;
// //   })
// //   .addBuilitinFunc("heading", 0, () => {
// //     return { type: "number", value: turtle.heading() } as RuntimeVal;
// //   })
// //   .addBuilitinFunc("isdown", 0, () => {
// //     return { type: "boolean", value: turtle.isdown() } as RuntimeVal;
// //   })
//   .addBuilitinFunc("print", 1, (args: RuntimeVal[]) => {
//     //@ts-ignore
//     Console.print(`${args[0].value} (${args[0].type})`);
//     console.log(`${args[0].value} (${args[0].type})`);

//     return MK_NULL();
//   });

// export const env = environment;





import Environment from "../lang/back/env";
import { MK_NULL, RuntimeVal } from "../lang/back/values";
import Console from "./console";

export class TurtleCanvas {
    private ctx: CanvasRenderingContext2D;
    private x = 0;
    private y = 0;
    private angle = -Math.PI / 2; // Default: Pointing Up
    private penDown = true;
    private penColor = "white";
    private penSize = 2;
    private fillColor = "white";
    
    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")!;
        this.reset();
    }
    
    reset() {
        this.x = this.ctx.canvas.width / 2;
        this.y = this.ctx.canvas.height / 2;
        this.angle = -Math.PI / 2;
        this.penDown = true;
        this.penColor = "white";
        this.penSize = 2;
        this.fillColor = "white";
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.strokeStyle = this.penColor;
        this.ctx.lineWidth = this.penSize;
    }
    
    forward(dist: number) {
        const newX = this.x + Math.cos(this.angle) * dist;
        const newY = this.y + Math.sin(this.angle) * dist;
        if (this.penDown) {
            this.ctx.lineTo(newX, newY);
            this.ctx.stroke();
        } else {
            this.ctx.moveTo(newX, newY);
        }
        this.x = newX;
        this.y = newY;
    }
    
    backward(dist: number) {
        this.forward(-dist);
    }
    
    right(deg: number) {
        this.angle += (deg * Math.PI) / 180;
    }
    
    left(deg: number) {
        this.angle -= (deg * Math.PI) / 180;
    }
    
    goto(x: number, y: number) {
        this.x = x;
        this.y = y;
        if (!this.penDown) {
            this.ctx.moveTo(x, y);
        } else {
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }
    
    setx(x: number) {
        this.goto(x, this.y);
    }
    
    sety(y: number) {
        this.goto(this.x, y);
    }
    
    setheading(angle: number) {
        this.angle = (angle * Math.PI) / 180;
    }
    
    home() {
        this.goto(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
        this.setheading(90);
    }
    
    circle(radius: number, extent: number = 360, steps?: number) {
        // extent: angle to draw (360 = full circle, 180 = semicircle)
        // steps: number of line segments (if undefined, calculate based on radius)
        
        if (!steps) {
            steps = Math.max(12, Math.floor(Math.abs(radius) / 2));
        }
        
        const angleStep = (extent * Math.PI / 180) / steps;
        const stepLength = 2 * Math.abs(radius) * Math.sin(Math.abs(angleStep) / 2);
        
        // Determine circle direction (radius sign determines clockwise/counterclockwise)
        const turnDirection = radius > 0 ? 1 : -1;
        
        // Move to circle start point
        // const startAngle = this.angle + (turnDirection * Math.PI / 2);
        
        for (let i = 0; i < steps; i++) {
            this.forward(stepLength);
            this.left(turnDirection * (extent / steps));
        }
    }
    
    dot(size?: number, color?: string) {
        const dotSize = size || this.penSize * 2;
        const oldFillStyle = this.ctx.fillStyle;
        
        this.ctx.fillStyle = color || this.penColor;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, dotSize / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = oldFillStyle;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
    }
    
    stamp() {
        // Draw a small triangle representing the turtle
        const size = 10;
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.angle + Math.PI / 2);
        
        this.ctx.fillStyle = this.penColor;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(-size / 2, size / 2);
        this.ctx.lineTo(size / 2, size / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
    }
    
    penup() {
        this.penDown = false;
    }
    
    pendown() {
        this.penDown = true;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
    }
    
    pensize(size: number) {
        this.penSize = size;
        this.ctx.lineWidth = size;
    }
    
    pencolor(color: string) {
        this.penColor = color;
        this.ctx.strokeStyle = color;
    }
    
    fillcolor(color: string) {
        this.fillColor = color;
        this.ctx.fillStyle = color;
    }
    
    color(color: string) {
        this.pencolor(color);
        this.fillcolor(color);
    }
    
    begin_fill() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
    }
    
    end_fill() {
        this.ctx.closePath();
        this.ctx.fillStyle = this.fillColor;
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
    }
    
    write(text: string, font: string = "16px Arial") {
        this.ctx.save();
        this.ctx.font = font;
        this.ctx.fillStyle = this.penColor;
        this.ctx.fillText(text, this.x, this.y);
        this.ctx.restore();
    }
    
    position(): [number, number] {
        return [this.x, this.y];
    }
    
    heading(): number {
        return (this.angle * 180 / Math.PI) % 360;
    }
    
    distance(x: number, y: number): number {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    }
    
    towards(x: number, y: number): number {
        const angle = Math.atan2(y - this.y, x - this.x);
        return (angle * 180 / Math.PI) % 360;
    }
    
    isdown(): boolean {
        return this.penDown;
    }
    
    width(): number {
        return this.ctx.canvas.width;
    }
    
    height(): number {
        return this.ctx.canvas.height;
    }
}

const canvasEl = document.getElementById('turtleCanvas') as HTMLCanvasElement;
export const turtle = new TurtleCanvas(canvasEl);

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
  .addBuilitinFunc("setheading", 1, (args: RuntimeVal[]) => {
    turtle.setheading((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("home", 0, () => {
    turtle.home();
    return MK_NULL();
  })
  
  // Drawing
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
  
  // Pen control
  .addBuilitinFunc("penup", 0, () => {
    turtle.penup();
    return MK_NULL();
  })
  .addBuilitinFunc("pendown", 0, () => {
    turtle.pendown();
    return MK_NULL();
  })
  .addBuilitinFunc("pensize", 1, (args: RuntimeVal[]) => {
    turtle.pensize((args[0] as any).value);
    return MK_NULL();
  })
  .addBuilitinFunc("pencolor", 1, (args: RuntimeVal[]) => {
    turtle.pencolor((args[0] as any).value);
    return MK_NULL();
  })
  
  // Color control
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
  
  // Text
  .addBuilitinFunc("write", 1, (args: RuntimeVal[]) => {
    turtle.write(String((args[0] as any).value));
    return MK_NULL();
  })
  
  // State queries
  .addBuilitinFunc("xcor", 0, () => {
    return { type: "number", value: turtle.position()[0] } as RuntimeVal;
  })
  .addBuilitinFunc("ycor", 0, () => {
    return { type: "number", value: turtle.position()[1] } as RuntimeVal;
  })
  .addBuilitinFunc("heading", 0, () => {
    return { type: "number", value: turtle.heading() } as RuntimeVal;
  })
  .addBuilitinFunc("isdown", 0, () => {
    return { type: "boolean", value: turtle.isdown() } as RuntimeVal;
  })

  .addBuilitinFunc("print", 1, (args: RuntimeVal[]) => {
    //@ts-ignore
    Console.print(`${args[0].value} (${args[0].type})`);
    console.log(`${args[0].value} (${args[0].type})`);

    return MK_NULL();
  });

export const env = environment;