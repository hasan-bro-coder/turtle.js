
interface TurtleState {
  x: number;
  y: number;
  angle: number;
  penDown: boolean;
  color: string;
  size: number;
  speed: number;
  isVisible: boolean;
}

export class TurtleCanvas {
  public state: TurtleState;
  private drawCtx: CanvasRenderingContext2D;
  private cursorCtx: CanvasRenderingContext2D;
  private currentExecutionId = 0;
  private fillPath: { x: number; y: number }[] = [];
  private isFilling = false;
  public drawCanvas: HTMLCanvasElement;
  // private cursorCanvas: HTMLCanvasElement;
  constructor(drawCanvas: HTMLCanvasElement, cursorCanvas: HTMLCanvasElement) {
    this.drawCanvas = drawCanvas;
    // this.cursorCanvas = cursorCanvas;
    this.drawCtx = drawCanvas.getContext("2d")!;
    this.cursorCtx = cursorCanvas.getContext("2d")!;
    this.state = this._getDefaultState();
    this.reset();
  }

  private async _move(distance: number): Promise<void> {
    const startId = this.currentExecutionId;
    const startX = this.state.x;
    const startY = this.state.y;
    const dirX = Math.cos(this.state.angle);
    const dirY = Math.sin(this.state.angle);

    const endX = startX + dirX * distance;
    const endY = startY + dirY * distance;

    const isInstant = this.state.speed === -1;
    const totalSteps = isInstant
      ? 1
      : Math.max(Math.ceil(Math.abs(distance / this.state.speed)), 2);

    for (let i = 1; i <= totalSteps; i++) {
      if (this.currentExecutionId !== startId) return;
      const progress = i / totalSteps;
      const prevX = this.state.x;
      const prevY = this.state.y;
      const nextX = startX + (endX - startX) * progress;
      const nextY = startY + (endY - startY) * progress;

      if (this.state.penDown) {
        this.drawCtx.beginPath();
        this.drawCtx.moveTo(prevX, prevY);
        this.drawCtx.lineTo(nextX, nextY);
        this.drawCtx.strokeStyle = this.state.color;
        this.drawCtx.lineWidth = this.state.size;
        this.drawCtx.stroke();
      }

      this.state.x = nextX;
      this.state.y = nextY;

      if (this.isFilling) this.fillPath.push({ x: nextX, y: nextY });

      this._renderCursor();
      if (!isInstant) await this._tick();
    }
  }

  private async _rotate(degrees: number): Promise<void> {
    const startId = this.currentExecutionId;
    const startAngle = this.state.angle;
    const radians = (degrees * Math.PI) / 180;
    const targetAngle = startAngle + radians;

    const isInstant = this.state.speed === -1;
    const totalSteps = isInstant
      ? 1
      : Math.max(1, Math.abs(degrees / this.state.speed));

    for (let i = 1; i <= totalSteps; i++) {
      if (this.currentExecutionId !== startId) return;

      const progress = i / totalSteps;
      this.state.angle = startAngle + (targetAngle - startAngle) * progress;

      this._renderCursor();
      if (!isInstant) await this._tick();
    }

    this.state.angle = targetAngle;
  }

  private _tick() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  private _renderCursor() {
    this.cursorCtx.clearRect(
      0,
      0,
      this.cursorCtx.canvas.width,
      this.cursorCtx.canvas.height,
    );
    if (!this.state.isVisible) return;

    this.cursorCtx.save();
    this.cursorCtx.translate(this.state.x, this.state.y);
    this.cursorCtx.rotate(this.state.angle + Math.PI / 2);

    this.cursorCtx.fillStyle = this.state.color;
    this.cursorCtx.beginPath();
    this.cursorCtx.moveTo(0, -10);
    this.cursorCtx.lineTo(7, 10);
    this.cursorCtx.lineTo(0, 5);
    this.cursorCtx.lineTo(-7, 10);
    this.cursorCtx.closePath();
    this.cursorCtx.fill();

    this.cursorCtx.restore();
  }

  private _getDefaultState(): TurtleState {
    return {
      x: this.drawCtx.canvas.width / 2,
      y: this.drawCtx.canvas.height / 2,
      angle: -Math.PI / 2,
      penDown: true,
      color: "white",
      size: 2,
      speed: 5,
      isVisible: true,
    };
  }

  async forward(n: number) {
    await this._move(n);
  }

  async backward(n: number) {
    await this._move(-n);
  }

  async right(deg: number) {
    await this._rotate(deg);
  }

  async left(deg: number) {
    await this._rotate(-deg);
  }

  async dot(size?: number, color?: string) {
    const radius = size ? size / 2 : this.state.size * 2;
    this.drawCtx.beginPath();
    this.drawCtx.arc(this.state.x, this.state.y, radius, 0, Math.PI * 2);
    this.drawCtx.fillStyle = color || this.state.color;
    this.drawCtx.fill();
    if (this.isFilling)
      this.fillPath.push({ x: this.state.x, y: this.state.y });
  }
  
  async circle(radius: number, extent: number = 360) {
    const executionId = this.currentExecutionId;
    const steps = Math.max(1, Math.floor(Math.abs(extent) / 8));
    const stepAngle = extent / steps;
    const stepAngleRad = (stepAngle * Math.PI) / 180;
    const chordDist = 2 * radius * Math.sin(stepAngleRad / 2);
    for (let i = 0; i < steps; i++) {
      if (this.currentExecutionId !== executionId) return;
      await this._rotate(stepAngle / 2);
      await this._move(chordDist);
      await this._rotate(stepAngle / 2);
      const delay = Math.max(0, 100 / (this.state.speed || 5));
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  async angle(targetDeg: number) {
    const currentDeg = (this.state.angle * 180) / Math.PI;
    let diff = targetDeg - currentDeg;
    diff = ((diff + 180) % 360) - 180;
    await this._rotate(diff);
  }

  pencolor(color: string) {
    this.state.color = color;
    this._renderCursor();
  }

  pensize(size: number) {
    this.state.size = size;
  }

  goto(x: number, y: number) {
    // 1. Calculate the center offsets
    const centerX = this.drawCanvas.width / 2;
    const centerY = this.drawCanvas.height / 2;

    // 2. Map the "Virtual" coordinates to "Physical" canvas coordinates
    // Note: We subtract y because in math, Y goes UP, but in canvas, Y goes DOWN.
    const physicalX = centerX + x;
    const physicalY = centerY - y;

    if (this.state.penDown) {
      this.drawCtx.beginPath();
      this.drawCtx.moveTo(this.state.x, this.state.y);
      this.drawCtx.lineTo(physicalX, physicalY);
      this.drawCtx.strokeStyle = this.state.color;
      this.drawCtx.lineWidth = this.state.size;
      this.drawCtx.stroke();
    }

    // Store physical coordinates consistently
    this.state.x = physicalX;
    this.state.y = physicalY;

    if (this.isFilling) this.fillPath.push({ x: physicalX, y: physicalY });

    this._renderCursor();
  }
  
  moveTo(x: number, y: number) {
    if (this.state.penDown) {
      this.drawCtx.beginPath();
      this.drawCtx.moveTo(this.state.x, this.state.y);
      this.drawCtx.lineTo(this.state.x + x, this.state.y + y);
      this.drawCtx.strokeStyle = this.state.color;
      this.drawCtx.lineWidth = this.state.size;
      this.drawCtx.stroke();
    }
    this.state.x += x;
    this.state.y += y;
    if (this.isFilling) this.fillPath.push({ x: this.state.x, y: this.state.y });
    this._renderCursor();
  }

  setx(x: number) {
    this.goto(x, this.state.y);
  }

  sety(y: number) {
    this.goto(this.state.x, y);
  }

  setspeed(s: number) {
    this.state.speed = s;
  }

  penup() {
    this.state.penDown = false;
  }

  pendown() {
    this.state.penDown = true;
  }

  hideturtle() {
    this.state.isVisible = false;
    this._renderCursor();
  }

  showturtle() {
    this.state.isVisible = true;
    this._renderCursor();
  }

  begin_fill() {
    this.isFilling = true;
    this.fillPath = [{ x: this.state.x, y: this.state.y }];
  }

  end_fill() {
    if (!this.isFilling || this.fillPath.length < 3) return;

    this.drawCtx.beginPath();
    this.drawCtx.moveTo(this.fillPath[0].x, this.fillPath[0].y);
    for (const point of this.fillPath) {
      this.drawCtx.lineTo(point.x, point.y);
    }
    this.drawCtx.closePath();
    this.drawCtx.fillStyle = this.state.color;
    this.drawCtx.fill();

    if (this.state.penDown) {
      this.drawCtx.strokeStyle = this.state.color;
      this.drawCtx.lineWidth = this.state.size;
      this.drawCtx.stroke();
    }

    this.isFilling = false;
    this.fillPath = [];
  }

  write(text: string, font: string = "16px Arial") {
    this.drawCtx.save();
    this.drawCtx.font = font;
    this.drawCtx.fillStyle = this.state.color;
    this.drawCtx.textAlign = "left";
    this.drawCtx.textBaseline = "middle";
    this.drawCtx.fillText(text, this.state.x, this.state.y);
    this.drawCtx.restore();
  }

  clear() {
    this.drawCtx.clearRect(
      0,
      0,
      this.drawCtx.canvas.width,
      this.drawCtx.canvas.height,
    );
  }

  reset() {
    this.currentExecutionId++;
    this.clear();
    this.cursorCtx.clearRect(
      0,
      0,
      this.cursorCtx.canvas.width,
      this.cursorCtx.canvas.height,
    );
    this.state = this._getDefaultState();
    this.isFilling = false;
    this.fillPath = [];
    this._renderCursor();
  }
}

// interface TurtleState {
//   x: number;
//   y: number;
//   angle: number;
//   penDown: boolean;
//   color: string;
//   size: number;
//   speed: number;
//   isVisible: boolean;
// }

// export class TurtleCanvas {
//   public state: TurtleState;
//   private drawCtx: CanvasRenderingContext2D;
//   private cursorCtx: CanvasRenderingContext2D;
//   private currentExecutionId = 0;
//   private fillPath: { x: number; y: number }[] = [];
//   private isFilling = false;
//   private drawCanvas: HTMLCanvasElement;
//   private cursorCanvas: HTMLCanvasElement;
//   constructor(drawCanvas: HTMLCanvasElement, cursorCanvas: HTMLCanvasElement) {
//     this.drawCanvas = drawCanvas;
//     this.cursorCanvas = cursorCanvas;
//     this.drawCtx = drawCanvas.getContext("2d")!;
//     this.cursorCtx = cursorCanvas.getContext("2d")!;
//     this.state = this._getDefaultState();
//     this.reset();
//   }

//   private async _move(distance: number): Promise<void> {
//     const startId = this.currentExecutionId;
//     const startX = this.state.x;
//     const startY = this.state.y;
//     const dirX = Math.cos(this.state.angle);
//     const dirY = Math.sin(this.state.angle);

//     const endX = startX + dirX * distance;
//     const endY = startY + dirY * distance;

//     const isInstant = this.state.speed === -1;
//     const totalSteps = isInstant
//       ? 1
//       : Math.max(Math.ceil(Math.abs(distance / this.state.speed)), 2);

//     for (let i = 1; i <= totalSteps; i++) {
//       if (this.currentExecutionId !== startId) return;
//       const progress = i / totalSteps;
//       const prevX = this.state.x;
//       const prevY = this.state.y;
//       const nextX = startX + (endX - startX) * progress;
//       const nextY = startY + (endY - startY) * progress;

//       if (this.state.penDown) {
//         this.drawCtx.beginPath();
//         this.drawCtx.moveTo(prevX, prevY);
//         this.drawCtx.lineTo(nextX, nextY);
//         this.drawCtx.strokeStyle = this.state.color;
//         this.drawCtx.lineWidth = this.state.size;
//         this.drawCtx.stroke();
//       }

//       this.state.x = nextX;
//       this.state.y = nextY;
//       // const nextX = startX + (endX - startX) * progress;
//       // const nextY = startY + (endY - startY) * progress;

//       // if (this.state.penDown) {
//       //   this.drawCtx.beginPath();
//       //   this.drawCtx.moveTo(prevX, prevY);
//       //   this.drawCtx.lineTo(nextX, nextY);
//       //   this.drawCtx.strokeStyle = this.state.color;
//       //   this.drawCtx.lineWidth = this.state.size;
//       //   this.drawCtx.stroke();
//       // }

//       // this.state.x = nextX;
//       // this.state.y = nextY;

//       if (this.isFilling) this.fillPath.push({ x: nextX, y: nextY });

//       this._renderCursor();
//       if (!isInstant) await this._tick();
//     }

//     // this.state.x = endX;
//     // this.state.y = endY;
//   }

//   private async _rotate(degrees: number): Promise<void> {
//     const startId = this.currentExecutionId;
//     const startAngle = this.state.angle;
//     const radians = (degrees * Math.PI) / 180;
//     const targetAngle = startAngle + radians;

//     const isInstant = this.state.speed === -1;
//     const totalSteps = isInstant
//       ? 1
//       : Math.max(1, Math.abs(degrees / this.state.speed));

//     for (let i = 1; i <= totalSteps; i++) {
//       if (this.currentExecutionId !== startId) return;

//       const progress = i / totalSteps;
//       this.state.angle = startAngle + (targetAngle - startAngle) * progress;

//       this._renderCursor();
//       if (!isInstant) await this._tick();
//     }

//     this.state.angle = targetAngle;
//   }

//   private _tick() {
//     return new Promise((resolve) => requestAnimationFrame(resolve));
//   }

//   private _renderCursor() {
//     this.cursorCtx.clearRect(
//       0,
//       0,
//       this.cursorCtx.canvas.width,
//       this.cursorCtx.canvas.height,
//     );
//     if (!this.state.isVisible) return;

//     this.cursorCtx.save();
//     this.cursorCtx.translate(this.state.x, this.state.y);
//     this.cursorCtx.rotate(this.state.angle + Math.PI / 2);

//     this.cursorCtx.fillStyle = this.state.color;
//     this.cursorCtx.beginPath();
//     this.cursorCtx.moveTo(0, -10);
//     this.cursorCtx.lineTo(7, 10);
//     this.cursorCtx.lineTo(0, 5);
//     this.cursorCtx.lineTo(-7, 10);
//     this.cursorCtx.closePath();
//     this.cursorCtx.fill();

//     this.cursorCtx.restore();
//   }

//   private _getDefaultState(): TurtleState {
//     return {
//       x: this.drawCtx.canvas.width / 2,
//       y: this.drawCtx.canvas.height / 2,
//       angle: -Math.PI / 2,
//       penDown: true,
//       color: "white",
//       size: 2,
//       speed: 5,
//       isVisible: true,
//     };
//   }

//   async forward(n: number) {
//     await this._move(n);
//   }

//   async backward(n: number) {
//     await this._move(-n);
//   }

//   async right(deg: number) {
//     await this._rotate(deg);
//   }

//   async left(deg: number) {
//     await this._rotate(-deg);
//   }

//   async dot(size?: number, color?: string) {
//     const radius = size ? size / 2 : this.state.size * 2;
//     this.drawCtx.beginPath();
//     this.drawCtx.arc(this.state.x, this.state.y, radius, 0, Math.PI * 2);
//     this.drawCtx.fillStyle = color || this.state.color;
//     this.drawCtx.fill();
//     if (this.isFilling)
//       this.fillPath.push({ x: this.state.x, y: this.state.y });
//   }
//   async circle(radius: number, extent: number = 360) {
//     const executionId = this.currentExecutionId;
//     const steps = Math.max(1, Math.floor(Math.abs(extent) / 8));
//     const stepAngle = extent / steps;
//     const stepAngleRad = (stepAngle * Math.PI) / 180;
//     const chordDist = 2 * radius * Math.sin(stepAngleRad / 2);
//     for (let i = 0; i < steps; i++) {
//       if (this.currentExecutionId !== executionId) return;
//       await this._rotate(stepAngle / 2);
//       await this._move(chordDist);
//       await this._rotate(stepAngle / 2);
//       const delay = Math.max(0, 100 / (this.state.speed || 5));
//       await new Promise((r) => setTimeout(r, delay));
//     }
//   }

//   // async circle(radius: number, extent: number = 360) {
//   //   const executionId = this.currentExecutionId;
//   //   const steps = Math.max(1, Math.floor(Math.abs(extent) / 8));
//   //   const stepDist = (2 * Math.PI * radius * (extent / 360)) / steps;
//   //   const stepAngle = extent / steps;
//   //   for (let i = 0; i < steps; i++) {
//   //     if (this.currentExecutionId !== executionId) return;
//   //     await this._move(stepDist);
//   //     await this._rotate(stepAngle);
//   //     // await new Promise(r => setTimeout(r, 100 / this.state.speed));
//   //   }
//   // }

//   async angle(targetDeg: number) {
//     const currentDeg = (this.state.angle * 180) / Math.PI;
//     let diff = targetDeg - currentDeg;
//     diff = ((diff + 180) % 360) - 180;
//     await this._rotate(diff);
//   }

//   pencolor(color: string) {
//     this.state.color = color;
//     this._renderCursor();
//   }

//   pensize(size: number) {
//     this.state.size = size;
//   }

//   goto(x: number, y: number) {
//     // 1. Calculate the center offsets
//     const centerX = this.drawCanvas.width / 2;
//     const centerY = this.drawCanvas.height / 2;

//     // 2. Map the "Virtual" coordinates to "Physical" canvas coordinates
//     // Note: We subtract y because in math, Y goes UP, but in canvas, Y goes DOWN.
//     const physicalX = centerX + x;
//     const physicalY = centerY - y;

//     if (this.state.penDown) {
//       this.drawCtx.beginPath();
//       // Convert current state to physical as well
//       this.drawCtx.moveTo(centerX + this.state.x, centerY - this.state.y);
//       this.drawCtx.lineTo(physicalX, physicalY);
//       this.drawCtx.strokeStyle = this.state.color;
//       this.drawCtx.lineWidth = this.state.size;
//       this.drawCtx.stroke();
//     }

//     // 3. Store the "Virtual" coordinates in state so the user's math stays consistent
//     this.state.x = x;
//     this.state.y = y;

//     if (this.isFilling) this.fillPath.push({ x: physicalX, y: physicalY });

//     this._renderCursor();
//   }
//   moveTo(x: number, y: number) {
//     if (this.state.penDown) {
//       this.drawCtx.beginPath();
//       this.drawCtx.moveTo(this.state.x, this.state.y);
//       this.drawCtx.lineTo(this.state.x + x, this.state.y + y);
//       this.drawCtx.strokeStyle = this.state.color;
//       this.drawCtx.lineWidth = this.state.size;
//       this.drawCtx.stroke();
//     }
//     this.state.x += x;
//     this.state.y += y;
//     if (this.isFilling) this.fillPath.push({ x, y });
//     this._renderCursor();
//   }

//   setx(x: number) {
//     this.goto(x, this.state.y);
//   }

//   sety(y: number) {
//     this.goto(this.state.x, y);
//   }

//   setspeed(s: number) {
//     this.state.speed = s;
//   }

//   penup() {
//     this.state.penDown = false;
//   }

//   pendown() {
//     this.state.penDown = true;
//   }

//   hideturtle() {
//     this.state.isVisible = false;
//     this._renderCursor();
//   }

//   showturtle() {
//     this.state.isVisible = true;
//     this._renderCursor();
//   }

//   begin_fill() {
//     this.isFilling = true;
//     this.fillPath = [{ x: this.state.x, y: this.state.y }];
//   }

//   end_fill() {
//     if (!this.isFilling || this.fillPath.length < 3) return;

//     this.drawCtx.beginPath();
//     this.drawCtx.moveTo(this.fillPath[0].x, this.fillPath[0].y);
//     for (const point of this.fillPath) {
//       this.drawCtx.lineTo(point.x, point.y);
//     }
//     this.drawCtx.closePath();
//     this.drawCtx.fillStyle = this.state.color;
//     this.drawCtx.fill();

//     if (this.state.penDown) {
//       this.drawCtx.strokeStyle = this.state.color;
//       this.drawCtx.lineWidth = this.state.size;
//       this.drawCtx.stroke();
//     }

//     this.isFilling = false;
//     this.fillPath = [];
//   }

//   write(text: string, font: string = "16px Arial") {
//     this.drawCtx.save();
//     this.drawCtx.font = font;
//     this.drawCtx.fillStyle = this.state.color;
//     this.drawCtx.textAlign = "left";
//     this.drawCtx.textBaseline = "middle";
//     this.drawCtx.fillText(text, this.state.x, this.state.y);
//     this.drawCtx.restore();
//   }

//   clear() {
//     this.drawCtx.clearRect(
//       0,
//       0,
//       this.drawCtx.canvas.width,
//       this.drawCtx.canvas.height,
//     );
//   }

//   reset() {
//     this.currentExecutionId++;
//     this.clear();
//     this.cursorCtx.clearRect(
//       0,
//       0,
//       this.cursorCtx.canvas.width,
//       this.cursorCtx.canvas.height,
//     );
//     this.state = this._getDefaultState();
//     this.isFilling = false;
//     this.fillPath = [];
//     this._renderCursor();
//   }
// }
