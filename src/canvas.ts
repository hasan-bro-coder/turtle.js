interface Command {
  type: string;
  args: any[];
  duration: number; // milliseconds
}

export class TurtleCanvas {
  private drawCtx: CanvasRenderingContext2D; // For permanent drawings
  private cursorCtx: CanvasRenderingContext2D; // For the cursor
  private x = 0;
  private y = 0;
  private angle = -Math.PI / 2; // Default: Pointing Up
  private penDown = true;
  private penColor = "white";
  private penSize = 2;
  private fillColor = "white";

  // Animation state
  private commandQueue: Command[] = [];
  private isAnimating = false;
  private animationSpeed = 1; // multiplier for animation speed
  private showTurtle = true;
  private turtleSize = 15;

  // For smooth animations
  private currentCommand: Command | null = null;
  private commandProgress = 0;
  private commandStartTime = 0;

  // Stored state for animations
  private startX = 0;
  private startY = 0;
  private startAngle = 0;
  private targetX = 0;
  private targetY = 0;
  private targetAngle = 0;

  // Fill path tracking
  private fillPath: [number, number][] = [];
  private isFilling = false;

  constructor(drawCanvas: HTMLCanvasElement, cursorCanvas: HTMLCanvasElement) {
    this.drawCtx = drawCanvas.getContext("2d")!;
    this.cursorCtx = cursorCanvas.getContext("2d")!;
    this.reset();
  }

  reset() {
    this.x = this.drawCtx.canvas.width / 2;
    this.y = this.drawCtx.canvas.height / 2;
    this.angle = -Math.PI / 2;
    this.penDown = true;
    this.penColor = "white";
    this.penSize = 2;
    this.fillColor = "white";
    this.commandQueue = [];
    this.isAnimating = false;
    this.currentCommand = null;
    this.fillPath = [];
    this.isFilling = false;
    this.drawCtx.clearRect(
      0,
      0,
      this.drawCtx.canvas.width,
      this.drawCtx.canvas.height,
    );
    this.cursorCtx.clearRect(
      0,
      0,
      this.cursorCtx.canvas.width,
      this.cursorCtx.canvas.height,
    );
    this.drawTurtle();
  }

  // Queue management
  private enqueue(command: Command) {
    this.commandQueue.push(command);
    if (!this.isAnimating) {
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.commandQueue.length === 0) {
      this.isAnimating = false;
      this.drawTurtle(); // Ensure turtle is drawn at the end
      return;
    }

    this.isAnimating = true;
    this.currentCommand = this.commandQueue.shift()!;
    this.commandProgress = 0;
    this.commandStartTime = Date.now();

    // Setup command-specific initial states
    this.setupCommand(this.currentCommand);

    // Start animation loop
    this.animate();
  }

  private setupCommand(command: Command) {
    switch (command.type) {
      case "forward":
      case "backward":
        this.startX = this.x;
        this.startY = this.y;
        const dist = command.args[0];
        this.targetX = this.x + Math.cos(this.angle) * dist;
        this.targetY = this.y + Math.sin(this.angle) * dist;
        break;

      case "right":
      case "left":
        this.startAngle = this.angle;
        this.targetAngle = this.angle + command.args[0];
        break;

      case "goto":
        this.startX = this.x;
        this.startY = this.y;
        this.targetX = command.args[0];
        this.targetY = command.args[1];
        break;

      case "setheading":
        this.startAngle = this.angle;
        this.targetAngle = command.args[0];
        break;

      case "circle":
        // Store circle parameters
        this.startX = this.x;
        this.startY = this.y;
        this.startAngle = this.angle;
        break;
    }
  }

  private animate() {
    if (!this.currentCommand) {
      this.processQueue();
      return;
    }

    const elapsed = Date.now() - this.commandStartTime;
    const adjustedDuration = this.currentCommand.duration / this.animationSpeed;
    this.commandProgress = Math.min(elapsed / adjustedDuration, 1);

    // Easing function for smooth motion
    const ease = this.easeInOutQuad(this.commandProgress);

    // Clear cursor canvas every frame
    this.cursorCtx.clearRect(
      0,
      0,
      this.cursorCtx.canvas.width,
      this.cursorCtx.canvas.height,
    );

    // Execute animation based on command type
    this.executeAnimationFrame(this.currentCommand, ease);

    // Draw the turtle on cursor canvas
    if (this.showTurtle) {
      this.drawTurtle();
    }

    // Continue or finish
    if (this.commandProgress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      // Finalize command
      this.finalizeCommand(this.currentCommand);
      this.currentCommand = null;
      this.processQueue();
    }
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  private executeAnimationFrame(command: Command, progress: number) {
    switch (command.type) {
      case "forward":
      case "backward":
        const currentX = this.startX + (this.targetX - this.startX) * progress;
        const currentY = this.startY + (this.targetY - this.startY) * progress;

        if (this.penDown) {
          this.drawCtx.beginPath();
          this.drawCtx.moveTo(this.startX, this.startY);
          this.drawCtx.lineTo(currentX, currentY);
          this.drawCtx.strokeStyle = this.penColor;
          this.drawCtx.lineWidth = this.penSize;
          this.drawCtx.stroke();
        }

        this.x = currentX;
        this.y = currentY;
        break;

      case "right":
      case "left":
        this.angle =
          this.startAngle + (this.targetAngle - this.startAngle) * progress;
        break;

      case "goto":
        const gotoX = this.startX + (this.targetX - this.startX) * progress;
        const gotoY = this.startY + (this.targetY - this.startY) * progress;

        if (this.penDown) {
          this.drawCtx.beginPath();
          this.drawCtx.moveTo(this.startX, this.startY);
          this.drawCtx.lineTo(gotoX, gotoY);
          this.drawCtx.strokeStyle = this.penColor;
          this.drawCtx.lineWidth = this.penSize;
          this.drawCtx.stroke();
        }

        this.x = gotoX;
        this.y = gotoY;
        break;

      case "setheading":
        this.angle =
          this.startAngle + (this.targetAngle - this.startAngle) * progress;
        break;

      case "circle":
        this.executeCircleAnimation(
          command.args[0],
          command.args[1],
          command.args[2],
          progress,
        );
        break;
    }
  }

  private executeCircleAnimation(
    radius: number,
    extent: number,
    steps: number,
    progress: number,
  ) {
    const angleStep = (extent * Math.PI) / 180 / steps;
    const stepLength = 2 * Math.abs(radius) * Math.sin(Math.abs(angleStep) / 2);
    const turnDirection = radius > 0 ? 1 : -1;

    const currentSteps = Math.floor(steps * progress);

    this.x = this.startX;
    this.y = this.startY;
    this.angle = this.startAngle;

    for (let i = 0; i < currentSteps; i++) {
      const newX = this.x + Math.cos(this.angle) * stepLength;
      const newY = this.y + Math.sin(this.angle) * stepLength;

      if (this.penDown) {
        this.drawCtx.beginPath();
        this.drawCtx.moveTo(this.x, this.y);
        this.drawCtx.lineTo(newX, newY);
        this.drawCtx.strokeStyle = this.penColor;
        this.drawCtx.lineWidth = this.penSize;
        this.drawCtx.stroke();
      }

      this.x = newX;
      this.y = newY;
      this.angle -= (turnDirection * (extent / steps) * Math.PI) / 180;
    }
  }

  private finalizeCommand(command: Command) {
    switch (command.type) {
      case "forward":
      case "backward":
      case "goto":
        this.x = this.targetX;
        this.y = this.targetY;
        if (this.isFilling) {
          this.fillPath.push([this.x, this.y]);
        }
        break;

      case "right":
      case "left":
      case "setheading":
        this.angle = this.targetAngle;
        break;

      case "circle":
        // Final position is already set
        if (this.isFilling) {
          this.fillPath.push([this.x, this.y]);
        }
        break;
    }
  }

private drawTurtle() {
    // Clear the cursor canvas before redrawing
    this.cursorCtx.clearRect(0, 0, this.cursorCtx.canvas.width, this.cursorCtx.canvas.height);
    
    this.cursorCtx.save();
    this.cursorCtx.translate(this.x, this.y);
    // Pointing direction (facing the angle)
    this.cursorCtx.rotate(this.angle + Math.PI / 2);

    this.cursorCtx.fillStyle = this.penColor;
    this.cursorCtx.strokeStyle = "rgba(0,0,0,0.5)"; // Subtle outline
    this.cursorCtx.lineWidth = 1;

    const s = this.turtleSize; 

    this.cursorCtx.beginPath();
    // Tip of the arrow (Front)
    this.cursorCtx.moveTo(0, -s / 2); 
    
    // Right back corner
    this.cursorCtx.lineTo(s / 2, s / 2); 
    
    // The "Missing Part" (Center indentation)
    // This pulls the back of the triangle inward
    this.cursorCtx.lineTo(0, s / 4); 
    
    // Left back corner
    this.cursorCtx.lineTo(-s / 2, s / 2); 
    
    this.cursorCtx.closePath();
    this.cursorCtx.fill();
    this.cursorCtx.stroke();

    this.cursorCtx.restore();
}

  // Public API methods - these now queue commands instead of executing immediately

  forward(dist: number) {
    const duration = Math.abs(dist) * 2; // 2ms per unit
    this.enqueue({ type: "forward", args: [dist], duration });
  }

  backward(dist: number) {
    this.forward(-dist);
  }

  right(deg: number) {
    const duration = Math.abs(deg) * 3; // 3ms per degree
    this.enqueue({ type: "right", args: [(deg * Math.PI) / 180], duration });
  }

  left(deg: number) {
    const duration = Math.abs(deg) * 3;
    this.enqueue({ type: "left", args: [(-deg * Math.PI) / 180], duration });
  }

  goto(x: number, y: number) {
    const distance = Math.sqrt(
      Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2),
    );
    const duration = distance * 2;
    this.enqueue({ type: "goto", args: [x, y], duration });
  }

  setx(x: number) {
    this.goto(x, this.y);
  }

  sety(y: number) {
    this.goto(this.x, y);
  }

  setheading(angle: number) {
    const angleDiff = Math.abs((angle * Math.PI) / 180 - this.angle);
    const duration = ((angleDiff * 180) / Math.PI) * 3;
    this.enqueue({
      type: "setheading",
      args: [(angle * Math.PI) / 180],
      duration,
    });
  }

  home() {
    this.goto(this.drawCtx.canvas.width / 2, this.drawCtx.canvas.height / 2);
    this.setheading(90);
  }

  circle(radius: number, extent: number = 360, steps?: number) {
    if (!steps) {
      steps = Math.max(12, Math.floor(Math.abs(radius) / 2));
    }
    const duration = Math.abs(extent) * 5; // 5ms per degree
    this.enqueue({ type: "circle", args: [radius, extent, steps], duration });
  }

  dot(size?: number, color?: string) {
    this.enqueue({
      type: "instant",
      args: [],
      duration: 0,
    });

    const dotSize = size || this.penSize * 2;
    const oldFillStyle = this.drawCtx.fillStyle;

    this.drawCtx.fillStyle = color || this.penColor;
    this.drawCtx.beginPath();
    this.drawCtx.arc(this.x, this.y, dotSize / 2, 0, 2 * Math.PI);
    this.drawCtx.fill();

    this.drawCtx.fillStyle = oldFillStyle;
  }

  stamp() {
    this.enqueue({
      type: "instant",
      args: [],
      duration: 0,
    });

    // Stamp on drawing canvas (permanent)
    const size = 10;
    this.drawCtx.save();
    this.drawCtx.translate(this.x, this.y);
    this.drawCtx.rotate(this.angle + Math.PI / 2);

    this.drawCtx.fillStyle = this.penColor;
    this.drawCtx.strokeStyle = this.penColor;
    this.drawCtx.lineWidth = 2;

    this.drawCtx.beginPath();
    this.drawCtx.moveTo(0, -size);
    this.drawCtx.lineTo(-size / 2, size / 2);
    this.drawCtx.lineTo(size / 2, size / 2);
    this.drawCtx.closePath();
    this.drawCtx.fill();
    this.drawCtx.stroke();

    this.drawCtx.restore();
  }

  // Pen control
  penup() {
    this.penDown = false;
  }

  pendown() {
    this.penDown = true;
  }

  pensize(size: number) {
    this.penSize = size;
  }

  pencolor(color: string) {
    this.penColor = color;
  }

  fillcolor(color: string) {
    this.fillColor = color;
  }

  color(color: string) {
    this.pencolor(color);
    this.fillcolor(color);
  }

  begin_fill() {
    this.isFilling = true;
    this.fillPath = [[this.x, this.y]];
  }

  end_fill() {
    if (this.fillPath.length > 0) {
      this.drawCtx.beginPath();
      this.drawCtx.moveTo(this.fillPath[0][0], this.fillPath[0][1]);
      for (let i = 1; i < this.fillPath.length; i++) {
        this.drawCtx.lineTo(this.fillPath[i][0], this.fillPath[i][1]);
      }
      this.drawCtx.closePath();
      this.drawCtx.fillStyle = this.fillColor;
      this.drawCtx.fill();
    }
    this.isFilling = false;
    this.fillPath = [];
  }

  clear() {
    this.drawCtx.clearRect(
      0,
      0,
      this.drawCtx.canvas.width,
      this.drawCtx.canvas.height,
    );
    this.cursorCtx.clearRect(
      0,
      0,
      this.cursorCtx.canvas.width,
      this.cursorCtx.canvas.height,
    );
  }

  write(text: string, font: string = "16px Arial") {
    this.drawCtx.save();
    this.drawCtx.font = font;
    this.drawCtx.fillStyle = this.penColor;
    this.drawCtx.fillText(text, this.x, this.y);
    this.drawCtx.restore();
  }

  // Utility methods
  speed(s: number) {
    // 0: no animation, 1-10: slowest to fastest
    if (s === 0) {
      this.animationSpeed = Infinity;
    } else {
      this.animationSpeed = s / 5;
    }
  }

  hideturtle() {
    this.showTurtle = false;
    this.cursorCtx.clearRect(
      0,
      0,
      this.cursorCtx.canvas.width,
      this.cursorCtx.canvas.height,
    );
  }

  showturtle() {
    this.showTurtle = true;
  }

  position(): [number, number] {
    return [this.x, this.y];
  }

  heading(): number {
    return ((this.angle * 180) / Math.PI) % 360;
  }

  distance(x: number, y: number): number {
    return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
  }

  towards(x: number, y: number): number {
    const angle = Math.atan2(y - this.y, x - this.x);
    return ((angle * 180) / Math.PI) % 360;
  }

  isdown(): boolean {
    return this.penDown;
  }

  width(): number {
    return this.drawCtx.canvas.width;
  }

  height(): number {
    return this.drawCtx.canvas.height;
  }
}
