// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Command {
  type: CommandType;
  args: any[];
  duration: number;
}

type CommandType =
  | "forward"
  | "backward"
  | "right"
  | "left"
  | "goto"
  | "move"
  | "angle"
  | "circle" 
  | "penup"
  | "pendown"
  | "pensize"
  | "pencolor"
  | "fillcolor"
  | "color"
  | "begin_fill"
  | "end_fill"
  | "dot"
  | "stamp"
  | "clear"
  | "write"
  | "instant";

interface TurtleState {
  x: number;
  y: number;
  angle: number;
  penDown: boolean;
  penColor: string;
  penSize: number;
  fillColor: string;
}

interface AnimationState {
  startX: number;
  startY: number;
  startAngle: number;
  targetX: number;
  targetY: number;
  targetAngle: number;
}

// ============================================================================
// ANIMATION HANDLER
// ============================================================================

class AnimationHandler {
  private commandQueue: Command[] = [];
  private isAnimating = false;
  private currentCommand: Command | null = null;
  private commandProgress = 0;
  private commandStartTime = 0;
  private animationSpeed = 1;

  constructor(
    private executor: CommandExecutor,
    private renderer: TurtleRenderer,
  ) {}

  enqueue(command: Command): void {
    this.commandQueue.push(command);
    if (!this.isAnimating) {
      this.processQueue();
    }
  }

  setSpeed(speed: number): void {
    if (speed === 0) {
      this.animationSpeed = Infinity;
    } else {
      this.animationSpeed = speed / 5;
    }
  }

  clear(): void {
    this.commandQueue = [];
    this.isAnimating = false;
    this.currentCommand = null;
  }

  private processQueue(): void {
    if (this.commandQueue.length === 0) {
      this.isAnimating = false;
      this.renderer.drawTurtle();
      return;
    }

    this.isAnimating = true;
    this.currentCommand = this.commandQueue.shift()!;
    this.commandProgress = 0;
    this.commandStartTime = Date.now();

    this.executor.setup(this.currentCommand);
    this.animate();
  }

  private animate(): void {
    if (!this.currentCommand) {
      this.processQueue();
      return;
    }

    const elapsed = Date.now() - this.commandStartTime;
    const adjustedDuration = this.currentCommand.duration / this.animationSpeed;
    this.commandProgress = Math.min(elapsed / adjustedDuration, 1);

    const easedProgress = this.easeInOutQuad(this.commandProgress);

    this.renderer.clearCursor();
    this.executor.execute(this.currentCommand, easedProgress);
    this.renderer.drawTurtle();

    if (this.commandProgress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.executor.finalize(this.currentCommand);
      this.currentCommand = null;
      this.processQueue();
    }
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
}

// ============================================================================
// COMMAND EXECUTOR
// ============================================================================

class CommandExecutor {
  private animState: AnimationState = {
    startX: 0,
    startY: 0,
    startAngle: 0,
    targetX: 0,
    targetY: 0,
    targetAngle: 0,
  };

  constructor(
    private state: TurtleState,
    private drawer: CanvasDrawer,
    private fillManager: FillManager,
  ) {}

  setup(command: Command): void {
    switch (command.type) {
      case "forward":
      case "backward":
        this.animState.startX = this.state.x;
        this.animState.startY = this.state.y;
        const dist = command.args[0];
        this.animState.targetX =
          this.state.x + Math.cos(this.state.angle) * dist;
        this.animState.targetY =
          this.state.y + Math.sin(this.state.angle) * dist;
        break;

      case "right":
      case "left":
        this.animState.startAngle = this.state.angle;
        this.animState.targetAngle = this.state.angle + command.args[0];
        break;

      case "goto":
        this.animState.startX = this.state.x;
        this.animState.startY = this.state.y;
        this.animState.targetX = command.args[0];
        this.animState.targetY = command.args[1];
        break;

      case "angle":
        this.animState.startAngle = this.state.angle;
        this.animState.targetAngle = command.args[0];
        break;

      case "circle":
        this.animState.startX = this.state.x;
        this.animState.startY = this.state.y;
        this.animState.startAngle = this.state.angle;
        break;

      case "begin_fill":
        this.fillManager.begin(this.state.x, this.state.y);
        break;

      case "end_fill":
        this.fillManager.end();
        break;
    }
  }

  execute(command: Command, progress: number): void {
    switch (command.type) {
      case "forward":
      case "backward":
        this.executeMove(progress);
        break;

      case "right":
      case "left":
        this.executeRotate(progress);
        break;

      case "goto":
        this.executeGoto(progress);
        break;

      case "move":
        this.executeGoto(progress);
        break;

      case "angle":
        this.executeRotate(progress);
        break;

      case "circle":
        this.executeCircle(command.args[0], command.args[1], command.args[2], progress);
        break;

      case "penup":
        this.state.penDown = false;
        break;

      case "pendown":
        this.state.penDown = true;
        break;

      case "pensize":
        this.state.penSize = command.args[0];
        break;

      case "pencolor":
        this.state.penColor = command.args[0];
        break;

      case "fillcolor":
        this.state.fillColor = command.args[0];
        break;

      case "color":
        this.state.penColor = command.args[0];
        this.state.fillColor = command.args[0];
        break;

      case "clear":
        this.drawer.clear();
        break;

      case "dot":
        this.drawer.drawDot(
          this.state.x,
          this.state.y,
          command.args[0] || this.state.penSize * 2,
          command.args[1] || this.state.penColor,
        );
        break;

      case "stamp":
        this.drawer.drawStamp(
          this.state.x,
          this.state.y,
          this.state.angle,
          this.state.penColor,
        );
        break;

      case "write":
        this.drawer.drawText(
          this.state.x,
          this.state.y,
          command.args[0],
          command.args[1],
          this.state.penColor,
        );
        break;
    }
  }

  finalize(command: Command): void {
    switch (command.type) {
      case "forward":
      case "backward":
      case "goto":
        this.state.x = this.animState.targetX;
        this.state.y = this.animState.targetY;
        this.fillManager.addPoint(this.state.x, this.state.y);
        break;
      // case "move":
      //   this.state.x = this.animState.targetX;
      //   this.state.y = this.animState.targetY;
      //   this.fillManager.addPoint(this.state.x, this.state.y);
        break;
      case "right":
      case "left":
      case "angle":
        this.state.angle = this.animState.targetAngle;
        break;

      case "circle":
        this.fillManager.addPoint(this.state.x, this.state.y);
        break;
    }
  }


  private executeRotate(progress: number): void {
    this.state.angle =
      this.animState.startAngle +
      (this.animState.targetAngle - this.animState.startAngle) * progress;
  }

  private executeGoto(progress: number): void {
    const gotoX =
      this.animState.startX +
      (this.animState.targetX - this.animState.startX) * progress;
    const gotoY =
      this.animState.startY +
      (this.animState.targetY - this.animState.startY) * progress;

    if (this.state.penDown) {
      this.drawer.drawLine(
        this.animState.startX,
        this.animState.startY,
        gotoX,
        gotoY,
        this.state.penColor,
        this.state.penSize,
      );
    }

    this.state.x = gotoX;
    this.state.y = gotoY;
  }

    private executeMove(progress: number): void {
    const gotoX =
      this.animState.startX +
      (this.animState.targetX - this.animState.startX) * progress;
    const gotoY =
      this.animState.startY +
      (this.animState.targetY - this.animState.startY) * progress;

    if (this.state.penDown) {
      this.drawer.drawLine(
        this.animState.startX,
        this.animState.startY,
        gotoX,
        gotoY,
        this.state.penColor,
        this.state.penSize,
      );
    }

    this.state.x = gotoX;
    this.state.y = gotoY;
  }

  private executeCircle(
    radius: number,
    extent: number,
    steps: number,
    progress: number,
  ): void {
    const angleStep = (extent * Math.PI) / 180 / steps;
    const stepLength = 2 * Math.abs(radius) * Math.sin(Math.abs(angleStep) / 2);
    const turnDirection = radius > 0 ? 1 : -1;
    const currentSteps = Math.floor(steps * progress);

    this.state.x = this.animState.startX;
    this.state.y = this.animState.startY;
    this.state.angle = this.animState.startAngle;

    for (let i = 0; i < currentSteps; i++) {
      const newX = this.state.x + Math.cos(this.state.angle) * stepLength;
      const newY = this.state.y + Math.sin(this.state.angle) * stepLength;

      if (this.state.penDown) {
        this.drawer.drawLine(
          this.state.x,
          this.state.y,
          newX,
          newY,
          this.state.penColor,
          this.state.penSize,
        );
      }

      this.state.x = newX;
      this.state.y = newY;
      this.state.angle -= (turnDirection * (extent / steps) * Math.PI) / 180;
    }
  }
}

// ============================================================================
// CANVAS DRAWER
// ============================================================================

class CanvasDrawer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number,
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  drawDot(x: number, y: number, size: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  drawStamp(x: number, y: number, angle: number, color: string): void {
    const size = 10;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle + Math.PI / 2);

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(-size / 2, size / 2);
    this.ctx.lineTo(size / 2, size / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawText(
    x: number,
    y: number,
    text: string,
    font: string = "16px Arial",
    color: string,
  ): void {
    this.ctx.save();
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}

// ============================================================================
// FILL MANAGER
// ============================================================================

class FillManager {
  private fillPath: [number, number][] = [];
  private isFilling = false;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private state: TurtleState,
  ) {}

  begin(x: number, y: number): void {
    this.isFilling = true;
    this.fillPath = [[x, y]];
  }

  addPoint(x: number, y: number): void {
    if (this.isFilling) {
      this.fillPath.push([x, y]);
    }
  }

  end(): void {
    if (this.fillPath.length > 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.fillPath[0][0], this.fillPath[0][1]);
      for (let i = 1; i < this.fillPath.length; i++) {
        this.ctx.lineTo(this.fillPath[i][0], this.fillPath[i][1]);
      }
      this.ctx.closePath();
      this.ctx.fillStyle = this.state.fillColor;
      this.ctx.fill();
    }
    this.isFilling = false;
    this.fillPath = [];
  }

  isActive(): boolean {
    return this.isFilling;
  }
}

// ============================================================================
// TURTLE RENDERER
// ============================================================================

class TurtleRenderer {
  private showTurtle = true;
  private turtleSize = 15;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private state: TurtleState,
  ) {}

  drawTurtle(): void {
    if (!this.showTurtle) return;

    this.ctx.save();
    this.ctx.translate(this.state.x, this.state.y);
    this.ctx.rotate(this.state.angle + Math.PI / 2);

    this.ctx.fillStyle = this.state.penColor;
    this.ctx.strokeStyle = "rgba(0,0,0,0.5)";
    this.ctx.lineWidth = 1;

    const s = this.turtleSize;

    this.ctx.beginPath();
    this.ctx.moveTo(0, -s / 2);
    this.ctx.lineTo(s / 2, s / 2);
    this.ctx.lineTo(0, s / 4);
    this.ctx.lineTo(-s / 2, s / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  clearCursor(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  setVisibility(visible: boolean): void {
    this.showTurtle = visible;
    if (!visible) {
      this.clearCursor();
    }
  }

  isVisible(): boolean {
    return this.showTurtle;
  }
}

// ============================================================================
// MAIN TURTLE CANVAS CLASS
// ============================================================================

export class TurtleCanvas {
  private state: TurtleState;
  private drawDrawer: CanvasDrawer;
  private cursorDrawer: CanvasDrawer;
  private fillManager: FillManager;
  private renderer: TurtleRenderer;
  private executor: CommandExecutor;
  private animator: AnimationHandler;

  constructor(drawCanvas: HTMLCanvasElement, cursorCanvas: HTMLCanvasElement) {
    const drawCtx = drawCanvas.getContext("2d")!;
    const cursorCtx = cursorCanvas.getContext("2d")!;

    this.state = {
      x: drawCanvas.width / 2,
      y: drawCanvas.height / 2,
      angle: -Math.PI / 2,
      penDown: true,
      penColor: "white",
      penSize: 2,
      fillColor: "white",
    };

    this.drawDrawer = new CanvasDrawer(drawCtx);
    this.cursorDrawer = new CanvasDrawer(cursorCtx);
    this.fillManager = new FillManager(drawCtx, this.state);
    this.renderer = new TurtleRenderer(cursorCtx, this.state);
    this.executor = new CommandExecutor(
      this.state,
      this.drawDrawer,
      this.fillManager,
    );
    this.animator = new AnimationHandler(this.executor, this.renderer);

    this.renderer.drawTurtle();
  }

  // ============================================================================
  // MOVEMENT COMMANDS
  // ============================================================================

  forward(dist: number): void {
    this.animator.enqueue({
      type: "forward",
      args: [dist],
      duration: Math.abs(dist) * 2,
    });
  }

  backward(dist: number): void {
    this.forward(-dist);
  }

  right(deg: number): void {
    this.animator.enqueue({
      type: "right",
      args: [(deg * Math.PI) / 180],
      duration: Math.abs(deg) * 3,
    });
  }

  left(deg: number): void {
    this.animator.enqueue({
      type: "left",
      args: [(-deg * Math.PI) / 180],
      duration: Math.abs(deg) * 3,
    });
  }

  goto(x: number, y: number): void {
    const distance = Math.sqrt(
      Math.pow(x - this.state.x, 2) + Math.pow(y - this.state.y, 2),
    );
    this.animator.enqueue({
      type: "goto",
      args: [x, y],
      duration: distance * 2,
    });
  }

  move(x: number, y: number): void {
    const distance = Math.sqrt(
      Math.pow(x, 2) + Math.pow(y, 2),
    );
    this.animator.enqueue({
      type: "goto",
      args: [this.state.x + x, this.state.y + y],
      duration: distance * 2,
    });
  }

  setx(x: number): void {
    this.goto(x, this.state.y);
  }

  sety(y: number): void {
    this.goto(this.state.x, y);
  }

  angle(angle: number): void {
    const angleDiff = Math.abs((angle * Math.PI) / 180 - this.state.angle);
    this.animator.enqueue({
      type: "angle",
      args: [(angle * Math.PI) / 180],
      duration: ((angleDiff * 180) / Math.PI) * 3,
    });
  }

  home(): void {
    const canvas = (this.drawDrawer as any).ctx.canvas;
    this.goto(canvas.width / 2, canvas.height / 2);
    this.angle(90);
  }

  circle(radius: number, extent: number = 360, steps?: number): void {
    if (!steps) {
      steps = Math.max(24, Math.floor(Math.abs(radius)));
    }
    this.animator.enqueue({
      type: "circle",
      args: [radius, extent, steps],
      duration: Math.abs(extent) * 5,
    });
  }

  // ============================================================================
  // PEN CONTROL
  // ============================================================================

  penup(): void {
    this.animator.enqueue({ type: "penup", args: [], duration: 0 });
  }

  pendown(): void {
    this.animator.enqueue({ type: "pendown", args: [], duration: 0 });
  }

  pensize(size: number): void {
    this.animator.enqueue({ type: "pensize", args: [size], duration: 0 });
  }

  pencolor(color: string): void {
    this.animator.enqueue({ type: "pencolor", args: [color], duration: 0 });
  }

  fillcolor(color: string): void {
    this.animator.enqueue({ type: "fillcolor", args: [color], duration: 0 });
  }

  color(color: string): void {
    this.animator.enqueue({ type: "color", args: [color], duration: 0 });
  }

  // ============================================================================
  // FILL COMMANDS
  // ============================================================================

  begin_fill(): void {
    this.animator.enqueue({ type: "begin_fill", args: [], duration: 0 });
  }

  end_fill(): void {
    this.animator.enqueue({ type: "end_fill", args: [], duration: 0 });
  }

  // ============================================================================
  // DRAWING COMMANDS
  // ============================================================================

  dot(size?: number, color?: string): void {
    this.animator.enqueue({
      type: "dot",
      args: [size, color],
      duration: 0,
    });
  }

  stamp(): void {
    this.animator.enqueue({ type: "stamp", args: [], duration: 0 });
  }

  write(text: string, font: string = "16px Arial"): void {
    this.animator.enqueue({
      type: "write",
      args: [text, font],
      duration: 0,
    });
  }

  // ============================================================================
  // CANVAS CONTROL
  // ============================================================================

  clear(): void {
    // Now properly queued!
    this.animator.enqueue({ type: "clear", args: [], duration: 0 });
  }

  reset(): void {
    const canvas = (this.drawDrawer as any).ctx.canvas;
    this.state.x = canvas.width / 2;
    this.state.y = canvas.height / 2;
    this.state.angle = -Math.PI / 2;
    this.state.penDown = true;
    this.state.penColor = "white";
    this.state.penSize = 2;
    this.state.fillColor = "white";
    this.animator.clear();
    this.drawDrawer.clear();
    this.cursorDrawer.clear();
    this.renderer.drawTurtle();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  speed(s: number): void {
    this.animator.setSpeed(s);
  }

  hideturtle(): void {
    this.renderer.setVisibility(false);
  }

  showturtle(): void {
    this.renderer.setVisibility(true);
  }

  position(): [number, number] {
    return [this.state.x, this.state.y];
  }

  heading(): number {
    return ((this.state.angle * 180) / Math.PI) % 360;
  }

  distance(x: number, y: number): number {
    return Math.sqrt(
      Math.pow(x - this.state.x, 2) + Math.pow(y - this.state.y, 2),
    );
  }

  towards(x: number, y: number): number {
    const angle = Math.atan2(y - this.state.y, x - this.state.x);
    return ((angle * 180) / Math.PI) % 360;
  }

  isdown(): boolean {
    return this.state.penDown;
  }

  width(): number {
    return (this.drawDrawer as any).ctx.canvas.width;
  }

  height(): number {
    return (this.drawDrawer as any).ctx.canvas.height;
  }
}