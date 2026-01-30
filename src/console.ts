class ConsoleClass {
  private static instance: ConsoleClass;
  private outputElement: HTMLDivElement | null = null;

  private constructor() {}

  static getInstance(): ConsoleClass {
    if (!ConsoleClass.instance) {
      ConsoleClass.instance = new ConsoleClass();
    }
    return ConsoleClass.instance;
  }
  initialize(elementId: string): void {
    this.outputElement = document.getElementById(elementId) as HTMLDivElement;
  }
  print(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
    console.log(message);
    if (this.outputElement) {
      const line = document.createElement('div');
      line.className = `log-${type}`;
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      line.innerHTML = `<span class="console-timestamp">[${timestamp}]</span> <span class="console-msg">${message}</span>`;
      
      this.outputElement.appendChild(line);
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
  }

  error(message: string): void {
    this.print(message, 'error');
    console.error(message);
  }

  clear(): void {
    if (this.outputElement) {
      this.outputElement.innerHTML = '';
    }
  }

//   private escapeHTML(str: string): string {
//     return str.replace(/[&<>"']/g, (m) => ({
//       '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
//     }[m] || m));
//   }
}

const Console = ConsoleClass.getInstance();
export default Console;