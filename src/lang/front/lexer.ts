// https://github.com/tlaceby/guide-to-interpreters-series
// -----------------------------------------------------------
// ---------------          LEXER          -------------------
// ---  Responsible for producing tokens from the source   ---
// -----------------------------------------------------------

// Represents tokens that our language understands in parsing.
export enum TokenType {
    // Literal Types
    Number,
    Identifier,
    String,
    // Keywords
    Set,
    If,
    Else,
    Loop,
    For,
    Func,
    Start,
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
    Bar,
    EOF, // Signified the end of file
}

/**
 * Constant lookup for keywords and known identifiers + symbols.
 */
const KEYWORDS: Record<string, TokenType> = {
    set: TokenType.Set,
    if: TokenType.If,
    else: TokenType.Else,
    loop: TokenType.Loop,
    for: TokenType.For,
    func: TokenType.Func,
    start: TokenType.Start,
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
    private tokens: Token[];
    private src: string[];
    public err: boolean;

    constructor(sourceCode: string) {
        // this.sourceCode = sourceCode;
        this.tokens = [];
        this.src = sourceCode.split("");
        this.err = false;
    }

    private token(value = "", type: TokenType): Token {
        return { value, type };
    }

    private isalpha(src: string): boolean {
        return src.toUpperCase() != src.toLowerCase();
    }

    private isskippable(str: string): boolean {
        return str == " " || str == "\t" || str == "\n";
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
            } else if (this.src[0] == "|") {
                this.tokens.push(this.token(this.src.shift(), TokenType.Bar));
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
                this.src[0] == "+" || this.src[0] == "-" || this.src[0] == "*" || this.src[0] == "/" ||
                this.src[0] == "%"
            ) {
                this.tokens.push(this.token(this.src.shift(), TokenType.BinaryOperator));
            } else if (this.src[0] == "<" || this.src[0] == ">" || this.src[0] == "!") {
                if (this.src[1] == "=") {
                    this.tokens.push(this.token(this.src.shift() + "=", TokenType.LogicalOperator));
                    this.src.shift();
                }
                this.tokens.push(this.token(this.src.shift(), TokenType.LogicalOperator));
            } else if (this.src[0] == "=") {
                if (this.src[1] == "=") {
                    this.src.shift();
                    this.src.shift();
                    this.tokens.push(this.token("==", TokenType.LogicalOperator));
                } else {
                    this.tokens.push(this.token(this.src.shift(), TokenType.Equals));
                }
            } else {
                if (this.isint(this.src[0])) {
                    let num = "";
                    while (this.src.length > 0 && this.isint(this.src[0]) && !this.err) {
                        num += this.src.shift();
                    }
                    this.tokens.push(this.token(num, TokenType.Number));
                } else if (this.isalpha(this.src[0])) {
                    let ident = "";
                    while (this.src.length > 0 && this.isalpha(this.src[0])) {
                        ident += this.src.shift();
                    }
                    const reserved = KEYWORDS[ident];
                    if (reserved) {
                        this.tokens.push(this.token(ident, reserved));
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
                        console.error("Unterminated string literal");
                        this.err = true;
                    }
                } else if (this.isskippable(this.src[0])) {
                    this.src.shift();
                } else {
                    console.error(
                        "Unreconized character found in source: " +
                        this.src[0].charCodeAt(0) +
                        this.src[0]
                    );
                    this.err = true;
                }
            }
        }

        this.tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
        return this.tokens;
    }
}
