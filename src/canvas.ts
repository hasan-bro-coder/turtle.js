// ============================================================================
// ASYNC TURTLE CANVAS - SIMPLIFIED VERSION
// No queue system needed - language handles sequencing
// ============================================================================

interface TurtleState {
  x: number;
  y: number;
  angle: number;
  penDown: boolean;
  penColor: string;
  penSize: number;
  fillColor: string;
}

// ============================================================================
// CANVAS DRAWER - Low-level drawing operations
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
    font: string,
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

  get canvas(): HTMLCanvasElement {
    return this.ctx.canvas;
  }
}

// ============================================================================
// FILL MANAGER - Handles shape filling
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
// TURTLE RENDERER - Draws the turtle cursor
// ============================================================================

class TurtleRenderer {
  private showTurtle = true;
  private turtleSize = 15;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private state: TurtleState,
  ) {}

  draw(): void {
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

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  setVisibility(visible: boolean): void {
    this.showTurtle = visible;
    if (!visible) {
      this.clear();
    }
  }

  isVisible(): boolean {
    return this.showTurtle;
  }
}

// ============================================================================
// ANIMATION HELPER - Provides smooth animations
// ============================================================================

class AnimationHelper {
  private animationSpeed = 1; // Default speed multiplier

  setSpeed(speed: number): void {
    if (speed === 0) {
      this.animationSpeed = Infinity; // Instant
    } else {
      this.animationSpeed = speed / 5;
    }
  }

  calculateDuration(baseTime: number): number {
    return baseTime / this.animationSpeed;
  }

  async animate(
    duration: number,
    callback: (progress: number) => void,
  ): Promise<void> {
    if (this.animationSpeed === Infinity) {
      callback(1);
      return;
    }

    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      const frame = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        callback(this.easeInOutQuad(progress));

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// MAIN TURTLE CANVAS CLASS
// ============================================================================

export class TurtleCanvas {
  private static instance: TurtleCanvas | null = null;

  private state: TurtleState;
  private drawDrawer: CanvasDrawer;
  private cursorDrawer: CanvasDrawer;
  private fillManager: FillManager;
  private renderer: TurtleRenderer;
  private animator: AnimationHelper;
  private drawCanvas: HTMLCanvasElement;
  private cursorCanvas: HTMLCanvasElement
  constructor(drawCanvas: HTMLCanvasElement, cursorCanvas: HTMLCanvasElement) {
    const drawCtx = drawCanvas.getContext("2d")!;
    const cursorCtx = cursorCanvas.getContext("2d")!;

    this.state = {
      x: drawCanvas.width / 2,
      y: drawCanvas.height / 2,
      angle: -Math.PI / 2, // Start pointing up
      penDown: true,
      penColor: "white",
      penSize: 2,
      fillColor: "white",
    };

    this.drawDrawer = new CanvasDrawer(drawCtx);
    this.cursorDrawer = new CanvasDrawer(cursorCtx);
    this.fillManager = new FillManager(drawCtx, this.state);
    this.renderer = new TurtleRenderer(cursorCtx, this.state);
    this.animator = new AnimationHelper();
    this.drawCanvas = drawCanvas;
    this.cursorCanvas = cursorCanvas;

    // this.renderer.draw();
    this.init();
  }
  private init(): void {
    const drawCtx = this.drawCanvas.getContext("2d")!;
    const cursorCtx = this.cursorCanvas.getContext("2d")!;

    // Reset all internal state to defaults
    this.state = {
      x: this.drawCanvas.width / 2,
      y: this.drawCanvas.height / 2,
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
    this.animator = new AnimationHelper();

    // Clear actual pixels
    this.drawDrawer.clear();
    this.cursorDrawer.clear();
    this.renderer.draw();
  }
  public static getInstance(
    drawCanvas?: HTMLCanvasElement,
    cursorCanvas?: HTMLCanvasElement,
  ): TurtleCanvas {
    if (!TurtleCanvas.instance) {
      if (!drawCanvas || !cursorCanvas) {
        throw new Error(
          "First call to TurtleCanvas.getInstance must provide canvas elements.",
        );
      }
      TurtleCanvas.instance = new TurtleCanvas(drawCanvas, cursorCanvas);
    }
    return TurtleCanvas.instance;
  }

  // ============================================================================
  // MOVEMENT COMMANDS
  // ============================================================================

  async forward(dist: number): Promise<void> {
    const startX = this.state.x;
    const startY = this.state.y;
    const targetX = this.state.x + Math.cos(this.state.angle) * dist;
    const targetY = this.state.y + Math.sin(this.state.angle) * dist;

    const duration = this.animator.calculateDuration(Math.abs(dist) * 2);

    await this.animator.animate(duration, (progress) => {
      this.renderer.clear();

      const currentX = startX + (targetX - startX) * progress;
      const currentY = startY + (targetY - startY) * progress;

      if (this.state.penDown) {
        this.drawDrawer.drawLine(
          startX,
          startY,
          currentX,
          currentY,
          this.state.penColor,
          this.state.penSize,
        );
      }

      this.state.x = currentX;
      this.state.y = currentY;
      this.renderer.draw();
    });

    this.state.x = targetX;
    this.state.y = targetY;
    this.fillManager.addPoint(this.state.x, this.state.y);
  }

  async backward(dist: number): Promise<void> {
    return this.forward(-dist);
  }

  async right(deg: number): Promise<void> {
    const startAngle = this.state.angle;
    const targetAngle = this.state.angle + (deg * Math.PI) / 180;
    const duration = this.animator.calculateDuration(Math.abs(deg) * 3);

    await this.animator.animate(duration, (progress) => {
      this.renderer.clear();
      this.state.angle = startAngle + (targetAngle - startAngle) * progress;
      this.renderer.draw();
    });

    this.state.angle = targetAngle;
  }

  async left(deg: number): Promise<void> {
    return this.right(-deg);
  }

  async goto(x: number, y: number): Promise<void> {
    const startX = this.state.x;
    const startY = this.state.y;
    const distance = Math.sqrt(
      Math.pow(x - startX, 2) + Math.pow(y - startY, 2),
    );
    const duration = this.animator.calculateDuration(distance * 2);

    await this.animator.animate(duration, (progress) => {
      this.renderer.clear();

      const currentX = startX + (x - startX) * progress;
      const currentY = startY + (y - startY) * progress;

      if (this.state.penDown) {
        this.drawDrawer.drawLine(
          startX,
          startY,
          currentX,
          currentY,
          this.state.penColor,
          this.state.penSize,
        );
      }

      this.state.x = currentX;
      this.state.y = currentY;
      this.renderer.draw();
    });

    this.state.x = x;
    this.state.y = y;
    this.fillManager.addPoint(this.state.x, this.state.y);
  }

  async move(dx: number, dy: number): Promise<void> {
    return this.goto(this.state.x + dx, this.state.y + dy);
  }

  async setx(x: number): Promise<void> {
    return this.goto(x, this.state.y);
  }

  async sety(y: number): Promise<void> {
    return this.goto(this.state.x, y);
  }

  async angle(angle: number): Promise<void> {
    const startAngle = this.state.angle;
    const targetAngle = (angle * Math.PI) / 180;
    const angleDiff = Math.abs(targetAngle - startAngle);
    const duration = this.animator.calculateDuration(
      ((angleDiff * 180) / Math.PI) * 3,
    );

    await this.animator.animate(duration, (progress) => {
      this.renderer.clear();
      this.state.angle = startAngle + (targetAngle - startAngle) * progress;
      this.renderer.draw();
    });

    this.state.angle = targetAngle;
  }

  async home(): Promise<void> {
    await this.goto(
      this.drawDrawer.canvas.width / 2,
      this.drawDrawer.canvas.height / 2,
    );
    await this.angle(90);
  }

  async circle(
    radius: number,
    extent: number = 360,
    steps?: number,
  ): Promise<void> {
    if (!steps) {
      steps = Math.max(24, Math.floor(Math.abs(radius)));
    }

    const angleStep = (extent * Math.PI) / 180 / steps;
    const stepLength = 2 * Math.abs(radius) * Math.sin(Math.abs(angleStep) / 2);
    const turnDirection = radius > 0 ? 1 : -1;
    const duration = this.animator.calculateDuration(Math.abs(extent) * 5);

    const startX = this.state.x;
    const startY = this.state.y;
    const startAngle = this.state.angle;

    await this.animator.animate(duration, (progress) => {
      this.renderer.clear();

      const currentSteps = Math.floor(steps! * progress);
      this.state.x = startX;
      this.state.y = startY;
      this.state.angle = startAngle;

      for (let i = 0; i < currentSteps; i++) {
        const newX = this.state.x + Math.cos(this.state.angle) * stepLength;
        const newY = this.state.y + Math.sin(this.state.angle) * stepLength;

        if (this.state.penDown) {
          this.drawDrawer.drawLine(
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
        this.state.angle -= (turnDirection * (extent / steps!) * Math.PI) / 180;
      }

      this.renderer.draw();
    });

    this.fillManager.addPoint(this.state.x, this.state.y);
  }

  // ============================================================================
  // PEN CONTROL
  // ============================================================================

  async penup(): Promise<void> {
    this.state.penDown = false;
  }

  async pendown(): Promise<void> {
    this.state.penDown = true;
  }

  async pensize(size: number): Promise<void> {
    this.state.penSize = size;
  }

  async pencolor(color: string): Promise<void> {
    this.state.penColor = color;
  }

  async fillcolor(color: string): Promise<void> {
    this.state.fillColor = color;
  }

  async color(color: string): Promise<void> {
    this.state.penColor = color;
    this.state.fillColor = color;
  }

  // ============================================================================
  // FILL COMMANDS
  // ============================================================================

  async begin_fill(): Promise<void> {
    this.fillManager.begin(this.state.x, this.state.y);
  }

  async end_fill(): Promise<void> {
    this.fillManager.end();
  }

  // ============================================================================
  // DRAWING COMMANDS
  // ============================================================================

  async dot(size?: number, color?: string): Promise<void> {
    const dotSize = size || this.state.penSize * 2;
    this.drawDrawer.drawDot(
      this.state.x,
      this.state.y,
      dotSize,
      color || this.state.penColor,
    );
  }

  async stamp(): Promise<void> {
    this.drawDrawer.drawStamp(
      this.state.x,
      this.state.y,
      this.state.angle,
      this.state.penColor,
    );
  }

  async write(text: string, font: string = "16px Arial"): Promise<void> {
    this.drawDrawer.drawText(
      this.state.x,
      this.state.y,
      text,
      font,
      this.state.penColor,
    );
  }

  // ============================================================================
  // CANVAS CONTROL
  // ============================================================================

  async clear(): Promise<void> {
    this.drawDrawer.clear();
  }

  async reset(): Promise<void> {
    this.init();
    // this.state.x = this.drawDrawer.canvas.width / 2;
    // this.state.y = this.drawDrawer.canvas.height / 2;
    // this.state.angle = -Math.PI / 2;
    // this.state.penDown = true;
    // this.state.penColor = "white";
    // this.state.penSize = 2;
    // this.state.fillColor = "white";

    // this.drawDrawer.clear();
    // this.cursorDrawer.clear();
    // this.renderer.draw();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async speed(s: number): Promise<void> {
    this.animator.setSpeed(s);
  }

  async hideturtle(): Promise<void> {
    this.renderer.setVisibility(false);
  }

  async showturtle(): Promise<void> {
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
    return this.drawDrawer.canvas.width;
  }

  height(): number {
    return this.drawDrawer.canvas.height;
  }
}
