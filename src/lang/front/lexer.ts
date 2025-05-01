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
function token(value = "", type: TokenType): Token {
    return { value, type };
}

/**
 * Returns whether the character passed in alphabetic -> [a-zA-Z]
 */
function isalpha(src: string) {
    return src.toUpperCase() != src.toLowerCase();
}

/**
 * Returns true if the character is whitespace like -> [\s, \t, \n]
 */
function isskippable(str: string) {
    return str == " " || str == "\t"
        || str == "\n"
        ;
}

/**
 Return whether the character is a valid integer -> [0-9]
 */
function isint(str: string) {
    const c = str.charCodeAt(0);
    const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return c >= bounds[0] && c <= bounds[1];
}

/**
 * Given a string representing source code: Produce tokens and handles
 * possible unidentified characters.
 *
 * - Returns a array of tokens.
 * - Does not modify the incoming string.
 */
export function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");
    let err = false; // Error flag for unreconized characters.
    // produce tokens until the EOF is reached.
    while (src.length > 0 && !err) {
        // BEGIN PARSING ONE CHARACTER TOKENS
        // if (src[0] == "\n") {
        //     src.shift(); // remove the new line character.
        //     tokens.push(token("\\n", TokenType.Nl));
        // }
        // else 
        if (src[0] == ",") {
            tokens.push(token(src.shift(), TokenType.Comma));
        }
        else if (src[0] == "#") {
            src.shift()
            // @ts-ignore
            while (src.length > 0 && src[0] != "\n") {
                src.shift(); // remove the comment.
            }
            // tokens.push(token(src.shift(), TokenType.Comma));
        }
        else if (src[0] == "|") {
            tokens.push(token(src.shift(), TokenType.Bar));
        }
        else if (src[0] == "(") {
            tokens.push(token(src.shift(), TokenType.OpenParen));
        } else if (src[0] == ")") {
            tokens.push(token(src.shift(), TokenType.CloseParen));
        }
        else if (src[0] == "[") {
            tokens.push(token(src.shift(), TokenType.OpenBrack));
        } else if (src[0] == "]") {
            tokens.push(token(src.shift(), TokenType.CloseBrack));
        }
        else if (src[0] == "{") {
            tokens.push(token(src.shift(), TokenType.OpenBrace));
        } else if (src[0] == "}") {
            tokens.push(token(src.shift(), TokenType.CloseBrace));
        }
        else if (
            src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" ||
            src[0] == "%"
        ) {
            tokens.push(token(src.shift(), TokenType.BinaryOperator));
        } // Handle Conditional & Assignment Tokens

        else if (src[0] == "<" || src[0] == ">" || src[0] == "!") {
            if (src[1] == "=") {

                tokens.push(token(src.shift() + "=", TokenType.LogicalOperator));
                src.shift(); // remove the '='
            }
            tokens.push(token(src.shift(), TokenType.LogicalOperator));
        } // Handle multi-character operators.
        else if (src[0] == "=") {
            if (src[1] == "=") {
                src.shift(); // remove the first '='
                src.shift()
                tokens.push(token("==", TokenType.LogicalOperator));
            } else {
                tokens.push(token(src.shift(), TokenType.Equals));
            }
        } // HANDLE MULTICHARACTER KEYWORDS, TOKENS, IDENTIFIERS ETC...
        else {
            // Handle numeric literals -> Integers
            if (isint(src[0])) {
                let num = "";
                while (src.length > 0 && isint(src[0]) && !err) {
                    num += src.shift();
                }

                // append new numeric token.
                tokens.push(token(num, TokenType.Number));
            } // Handle Identifier & Keyword Tokens.
            else if (isalpha(src[0])) {
                let ident = "";
                while (src.length > 0 && isalpha(src[0])) {
                    ident += src.shift();
                }

                // CHECK FOR RESERVED KEYWORDS
                const reserved = KEYWORDS[ident];
                // If value is not undefined then the identifier is
                // reconized keyword
                if (reserved) {
                    tokens.push(token(ident, reserved));
                } else {
                    // Unreconized name must mean user defined symbol.
                    tokens.push(token(ident, TokenType.Identifier));
                }

            } else if (src[0] === '"' || src[0] === "'") {
                const quoteType = src.shift(); // Remove the opening quote
                let str = "";
                while (src.length > 0 && src[0] !== quoteType) {
                    str += src.shift();
                }
                if (src[0] === quoteType) {
                    src.shift(); // Remove the closing quote
                    tokens.push(token(str, TokenType.String));
                } else {
                    // console.error
                    err = true;
                    throw ("Unterminated string literal");
                }
            } else if (isskippable(src[0])) {
                // Skip uneeded chars.
                src.shift();
            } // Handle unreconized characters.
            // TODO: Impliment better errors and error recovery.
            else {
                // console.error
                err = true;
                throw (
                    "Unreconized character found in source: " +
                    src[0].charCodeAt(0) + 
                    src[0]
                );
                // Deno.exit(1);
            }
        }
    }

    tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
    return tokens;
}