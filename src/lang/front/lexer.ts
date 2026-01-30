export enum TokenType {
  // Literal Types
  Number,
  Identifier,
  String,
  Bool,
  // Keywords
  If,
  Else,
  Loop,
  For,
  Func,
  Do,
  End,

  // Grouping * Operators
  BinaryOperator,
  LogicalOperator,
  Equals,

  OpenParen,
  CloseParen,
  OpenBrack,
  CloseBrack,
  OpenBrace,
  CloseBrace,
  Comma,
  Line,
  EOF, // Signified the end of file
}

/**
 * Constant lookup for keywords and known identifiers + symbols.
 */
const KEYWORDS: Record<string, TokenType> = {
  if: TokenType.If,
  else: TokenType.Else,
  loop: TokenType.Loop,
  for: TokenType.For,
  fn: TokenType.Func,
  do: TokenType.Do,
  end: TokenType.End,
};

// Reoresents a single token from the source-code.
export interface Token {
  value: string; // contains the raw value as seen inside the source code.
  type: TokenType; // tagged structure.
}

// Returns a token of a given type and value
export class Lexer {
  // private sourceCode: string;
  private tokens: Token[] = [];
  private src: string[];
  public errMessage: string = "";
  public err: boolean = false;

  constructor(sourceCode: string) {
    this.src = sourceCode.split("");
  }

  private token(value = "", type: TokenType): Token {
    return { value, type };
  }

  private isalpha(src: string): boolean {
    return src.toUpperCase() != src.toLowerCase() || src == "_";
  }

  private isskippable(str: string): boolean {
    return str == " " || str == "\t";
  }

  private isint(str: string): boolean {
    const c = str.charCodeAt(0);
    const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return c >= bounds[0] && c <= bounds[1];
  }

  public tokenize(): Token[] {
    while (this.src.length > 0 && !this.err) {
      if (this.src[0] == ",") {
        this.tokens.push(this.token(this.src.shift(), TokenType.Comma));
      } else if (this.src[0] == "#") {
        this.src.shift();
        // @ts-ignore
        while (this.src.length > 0 && this.src[0] != "\n") {
          this.src.shift();
        }
      } else if (this.src[0] == "(") {
        this.tokens.push(this.token(this.src.shift(), TokenType.OpenParen));
      } else if (this.src[0] == ")") {
        this.tokens.push(this.token(this.src.shift(), TokenType.CloseParen));
      } else if (this.src[0] == "[") {
        this.tokens.push(this.token(this.src.shift(), TokenType.OpenBrack));
      } else if (this.src[0] == "]") {
        this.tokens.push(this.token(this.src.shift(), TokenType.CloseBrack));
      } else if (this.src[0] == "{") {
        this.tokens.push(this.token(this.src.shift(), TokenType.OpenBrace));
      } else if (this.src[0] == "}") {
        this.tokens.push(this.token(this.src.shift(), TokenType.CloseBrace));
      } else if (
        this.src[0] == "+" ||
        this.src[0] == "*" ||
        this.src[0] == "/" ||
        this.src[0] == "%"
      ) {
        this.tokens.push(
          this.token(this.src.shift(), TokenType.BinaryOperator),
        );
      } else if (
        this.src[0] == "<" ||
        this.src[0] == ">" ||
        this.src[0] == "!" ||
        this.src[0] == "|" ||
        this.src[0] == "&"
      ) {
        if (this.src[1] == "=") {
          this.tokens.push(
            this.token(this.src.shift() + "=", TokenType.LogicalOperator),
          );
          this.src.shift();
          continue;
        }
        this.tokens.push(
          this.token(this.src.shift(), TokenType.LogicalOperator),
        );
      } else if (this.src[0] == "=") {
        if (this.src[1] == "=") {
          this.src.shift();
          this.src.shift();
          this.tokens.push(this.token("==", TokenType.LogicalOperator));
        } else {
          this.tokens.push(this.token(this.src.shift(), TokenType.Equals));
        }
      } else if (this.src[0] == "-") {
        
        if (this.isint(this.src[1])) {
          let num = this.src.shift() as string; // Include the '-' sign
          let hasDot = false;
          while (
            this.src.length > 0 &&
            //@ts-ignore
            (this.isint(this.src[0]) || (!hasDot && this.src[0] === ".")) &&
            !this.err
          ) {
            //@ts-ignore
            if (this.src[0] === ".") {
              hasDot = true;
            }
            num += this.src.shift();
          }
          if (
            hasDot &&
            num.split(".").length === 2 &&
            num.split(".")[1] !== ""
          ) {
            this.tokens.push(this.token(num, TokenType.Number));
          } else if (!hasDot) {
            this.tokens.push(this.token(num, TokenType.Number));
          } else {
            this.errMessage = "Invalid float format";
            this.err = true;
          }
        }else{
          this.tokens.push(
          this.token(this.src.shift(), TokenType.BinaryOperator),
        );
        }
      } else {
        if (this.isint(this.src[0])) {
          let num = "";
          let hasDot = false;
          while (
            this.src.length > 0 &&
            (this.isint(this.src[0]) || (!hasDot && this.src[0] === ".")) &&
            !this.err
          ) {
            if (this.src[0] === ".") {
              hasDot = true;
            }
            num += this.src.shift();
          }
          if (
            hasDot &&
            num.split(".").length === 2 &&
            num.split(".")[1] !== ""
          ) {
            this.tokens.push(this.token(num, TokenType.Number));
          } else if (!hasDot) {
            this.tokens.push(this.token(num, TokenType.Number));
          } else {
            this.errMessage = "Invalid float format";
            this.err = true;
          }
        } else if (this.isalpha(this.src[0])) {
          let ident = "";
          while (this.src.length > 0 && (this.isalpha(this.src[0]) || this.isint(this.src[0]))) {
            ident += this.src.shift();
          }
          const reserved = KEYWORDS[ident];
          if (reserved) {
            this.tokens.push(this.token(ident, reserved));
          } else if (ident == "true" || ident == "false") {
            this.tokens.push(this.token(ident, TokenType.Bool));
          } else {
            this.tokens.push(this.token(ident, TokenType.Identifier));
          }
        } else if (this.src[0] === '"' || this.src[0] === "'") {
          const quoteType = this.src.shift();
          let str = "";
          while (this.src.length > 0 && this.src[0] !== quoteType) {
            str += this.src.shift();
          }
          if (this.src[0] === quoteType) {
            this.src.shift();
            this.tokens.push(this.token(str, TokenType.String));
          } else {
            this.errMessage = "Unterminated string literal";
            this.err = true;
          }
        } else if (this.src[0] == "\n") {
          this.src.shift(); // Consume the newline

          // Check if the last token was already a Line or if tokens array is empty
          // This prevents "Empty" tokens at the Do or multiple lines in a row
          const lastToken = this.tokens[this.tokens.length - 1];

          if (lastToken && lastToken.type !== TokenType.Line) {
            this.tokens.push(this.token("\n", TokenType.Line));
          }
        } else if (this.isskippable(this.src[0])) {
          this.src.shift();
        } else {
          this.errMessage = "Unreconized character found in source";
          this.err = true;
        }
      }
    }

    this.tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
    return this.tokens;
  }
}
