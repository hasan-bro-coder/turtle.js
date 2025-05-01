// interface EditorProps {

import { FC, useEffect, useRef} from "react";
import Environment from "../lang/back/env";
import { MK_NULL } from "../lang/back/values";
import { run } from "../lang/run";
import { useDispatch, useSelector } from "react-redux";
import { addConsole } from "../store";


let env: Environment = new Environment();

let clear = () => {
  console.error("clear empty");

}

interface CanvasProp {
  isClicked: boolean;
  setRunning: (running: boolean) => void;
}

let Canvas: FC<CanvasProp> = (props) => {
  let code = useSelector((state: any) => state.code);

  useEffect(() => {
    if (props.isClicked) {
      ran(code)
      props.setRunning(false)
    }
  }, [props.isClicked])
  const ran = (code: string) => {
    // alert('run from Child! '+props.isClicked);
    clear();
    run(code, new Environment(env));
  };

  const canvas = useRef(null);
  let dispatch = useDispatch();

  class Canvas {
    constructor(canvas: HTMLCanvasElement) {
      let ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Canvas or context not found");
      }
      this.canvas = canvas;
      this.ctx = ctx;
      this.ctx.scale(1, 1);



      this.ctx.lineCap = 'round';
      this.canvas.width = this.width;
      // window.innerWidth / 2.1;
      this.canvas.height = this.height;
      // window.innerWidth / 2.1;
      // window.innerHeight / 2.1;
      // this.canvas.style.border = "1px solid black";
      this.canvas.style.backgroundColor = "#2b2b2b";

      
    }

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    dim: number = Math.floor(window.innerWidth / 240) * 100;
    width: number = this.dim;
    height: number = this.dim;
    x: number = this.width / 2;
    y: number = this.height / 2;
    angle: number = 0;
    color: string = "#ffffff";
    lineWidth: number = 1;
    
    
    async forward(distance: number) {
      // await new Promise<void>((resolve) => {
      //   setTimeout(() => {
      //     resolve();
      //   }, 500);
      // });

      const radians = this.angle * Math.PI / 180;
      const newX = this.x + distance * Math.cos(radians);
      const newY = this.y + distance * Math.sin(radians);

      // this.ctx.this.color;
      // self._position + self._orient * distance
      // 
      // 
      // 
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.strokeStyle = this.color;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(newX, newY);
      this.ctx.stroke();

      this.x = newX;
      this.y = newY;
      this.ctx.moveTo(this.x, this.y);


      return this;
    }

    backward(distance: number) {
      const radians = this.angle * Math.PI / 180;
      const newX = this.x - distance * Math.cos(radians);
      const newY = this.y - distance * Math.sin(radians);
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.strokeStyle = this.color;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(newX, newY);
      this.ctx.stroke();

      this.x = newX;
      this.y = newY;
      this.ctx.moveTo(this.x, this.y);

      return this;
    }
    
    left(degrees: number) {
      this.angle -= degrees;

      return this;

    }

    right(degrees: number) {
      this.angle += degrees;
      return this;
    }

    goto(x: number, y: number) {
      this.x = x;
      this.y = y;
      return this;
    }

    circle(radius: number, extent?: number, steps?: number) {
      if (extent === undefined) {
        extent = 360; // Full circle
      }
      if (steps === undefined) {
        const frac = Math.abs(extent) / 360;
        steps = 1 + Math.floor(Math.min(11 + Math.abs(radius) / 6.0, 59.0) * frac);
      }
      const w = extent / steps;
      const w2 = 0.5 * w;
      const l = 2.0 * radius * Math.sin((Math.PI / 180) * w2);

      this.right(w2); // Rotate half step before starting
      for (let i = 0; i < steps; i++) {
        this.forward(l);
        this.right(w);
      }
      this.left(w2); // Rotate back half step after finishing
      return this;
    }

    setColor(value: string) {
      this.color = value;
      return this;
    }
    setLineWidth(value: number) {
      this.lineWidth = value;
      return this;
    }

    clear() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.x = this.width / 2;
      this.y = this.height / 2;
      this.angle = 0;
      return this;
    }


    // drawRect(x: number, y: number, width: number, height: number) {
    //   if (this.ctx) {
    //     this.ctx.fillStyle = "red";
    //     this.ctx.fillRect(x, y, width, height);
    //   }
    // }
  }

  useEffect(() => {
    if (canvas.current == null) {
      throw new Error("Canvas not found in ref");
    }
    const c = new Canvas(canvas.current as HTMLCanvasElement);

    clear = () => {
      c.clear();
    }

    env.addBuilitinFunc("forward", 1, (args: any[]) => {
      // console.log(args[0].value);
      c.forward(args[0].value);
      return MK_NULL();
    })
    .addBuilitinFunc("print", 1, (args: any[]) => {
          console.log(args[0].value);
          dispatch(addConsole(args[0].value));
          return MK_NULL();
        })
      .addBuilitinFunc("left", 1, (args: any[]) => {
        // console.log(args[0].value);
        c.left(args[0].value);
        return MK_NULL();
      })
      .addBuilitinFunc("goto", 2, (args: any[]) => {
        // console.log(args[0].value);
        c.goto(args[0].value, args[1].value);
        return MK_NULL();
      })
      .addBuilitinFunc("backward", 1, (args: any[]) => {
        c.backward(args[0].value);
        return MK_NULL();
      })
      .addBuilitinFunc("right", 1, (args: any[]) => {
        c.right(args[0].value);
        return MK_NULL();
      })
      .addBuilitinFunc("circle", 3, (args: any[]) => {
        c.circle(args[0].value, args[1]?.value, args[2]?.value);
        return MK_NULL();
      })
      .addBuilitinFunc("linewidth", 1, (args: any[]) => {
        c.setLineWidth(args[0].value);
        return MK_NULL();
      })
      .addBuilitinFunc("color", 1, (args: any[]) => {
        c.setColor(args[0].value);
        return MK_NULL();
      })
      .addBuilitinFunc("clear", 0, () => {
        c.clear();
        return MK_NULL();
      });


  }, [])



  return (
    <div id="canvas-con">
      <canvas id="canvas" ref={canvas}></canvas>
    </div>
  );
}



export default Canvas;
