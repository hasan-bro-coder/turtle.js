class Console {
  private static instance: Console;
  private outputElement: HTMLDivElement | null = null;

  private constructor() {}

  static getInstance(): Console {
    if (!Console.instance) {
      Console.instance = new Console();
    }
    return Console.instance;
  }

  /**
   * Connects the class to the HTML element in the DOM
   */
  initialize(elementId: string): void {
    this.outputElement = document.getElementById(elementId) as HTMLDivElement;
  }

  /**
   * Appends a message to the UI and browser console
   */
  print(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
    console.log(message); // Still log to dev tools

    if (this.outputElement) {
      const line = document.createElement('div');
      line.className = `log-${type}`;
      
      // Optional: Add a timestamp or prefix
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      line.innerHTML = `<span class="console-timestamp">[${timestamp}]</span> <span class="console-msg">${this.escapeHTML(message)}</span>`;
      
      this.outputElement.appendChild(line);
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
  }

  error(message: string): void {
    this.print(message, 'error');
    // We don't throw here usually, because it would stop the whole 
    // Interpreter loop. Let the Interpreter handle the "stop" logic.
    console.error(message);
  }

  clear(): void {
    if (this.outputElement) {
      this.outputElement.innerHTML = '';
    }
  }

  private escapeHTML(str: string): string {
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m] || m));
  }
}

const consoleInstance = Console.getInstance();
export default consoleInstance;