import {
    BinaryExpr,
    FuncExpr,
    LogicalExpr,
    VarStmt,
    IfStmt,
    LoopStmt,
    BlockStmt,
    FuncStmt,
    Expr,
    Identifier,
    NumericLiteral,
    Program,
    Stmt,
    ForStmt,
    StringLiteral,
} from "./ast.ts";

import { Token, TokenType } from "./lexer.ts";

/**
 * Frontend for producing a valid AST from sourcode
 */
export default class Parser {
    private tokens: Token[] = [];
    public err = false;
    /*
     * Determines if the parsing is complete and the END OF FILE Is reached.
     */
    private not_eof(): boolean {
        return this.tokens[0].type != TokenType.EOF && !this.err;
    }

    /**
     * Returns the currently available token
     */
    private at() {
        return this.tokens[0] as Token;
    }

    /**
     * Returns the previous token and then advances the tokens array to the next value.
     */
    private eat() {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    /**
     * Returns the previous token and then advances the tokens array to the next value.
     *  Also checks the type of expected token and throws if the values dnot match.
     */
    private expect(type: TokenType, err: any) {
        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type != type) {
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            this.err = true;
            // Deno.exit(1);
        }

        return prev;
    }

    public produceAST(tokens: Token[]): Program {
        //   this.tokens = tokenize(sourceCode);
        this.tokens = tokens;
        const program: Program = {
            kind: "Program",
            body: [],
        };

        // Parse until end of file
        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }

        return program;
    }

    private parse_block_stmt(): BlockStmt {
        // this.eat(); // eat the opening brace
        let props = [] as Stmt[];
        while (this.at().type != TokenType.CloseBrace && this.not_eof()) {
            // console.log(this.at());

            const prop = this.parse_stmt();
            props.push(prop);
            // if (this.at().type == TokenType.Comma) {
            // this.eat(); // eat the comma
            // } else {
            // break;
            // }
        }
        this.eat()
        return { kind: "BlockStmt", body: props } as BlockStmt;
    }
    // Handle complex statement types
    private parse_stmt(): Stmt {
        switch (this.at().type) {
            case TokenType.OpenBrace: {
                this.eat(); // eat the opening paren
                switch (this.at().type) {
                    case TokenType.Set: {
                        this.eat(); // eat the var keyword
                        const varName = this.eat().value; // eat the variable name
                        this.expect(TokenType.Equals, "Unexpected token found Expected equals."); // closing brace
                        let value = this.parse_expr(); // eat the variable value
                        this.expect(TokenType.CloseBrace, "Unexpected token found inside parenthesised expression. Expected closing brace."); // closing brace
                        return {
                            kind: "VarStmt",
                            name: varName,
                            value,
                        } as VarStmt;
                    }
                    case TokenType.If: {
                        this.eat(); // eat the var keyword
                        let ifCondition = this.parse_expr(); // eat the variable value
                        let ifBody = this.parse_block_stmt(); // eat the variable value
                        return { kind: "IfStmt",condition: ifCondition, body: ifBody } as IfStmt;
                    }
                    case TokenType.Loop: {
                        this.eat(); // eat the var keyword
                        let loopCondition = this.parse_expr(); // eat the variable value
                        let loopBody = this.parse_block_stmt(); // eat the variable value
                        return { kind: "LoopStmt", condition: loopCondition, body: loopBody } as LoopStmt;
                    }
                    case TokenType.For: {
                        this.eat(); // eat the var keyword
                        let varname = this.expect(TokenType.Identifier,
                            "Unexpected token found during parsing! expected var name in for loop").value; // eat the variable name
                        let amount = this.parse_expr(); // eat the variable name
                        let loopBody = this.parse_block_stmt(); // eat the variable value
                        return { kind: "ForStmt", body: loopBody,varname,amount} as ForStmt;
                    }
                    case TokenType.Func: {
                        this.eat(); // eat the var keyword
                        let name = this.expect(TokenType.Identifier, "Unexpected token found during parsing! expected func name").value; // eat the variable value
                        let args = [] as string[];
                        if (this.at().type == TokenType.Bar) {
                            this.eat(); // eat the opening paren
                            while (this.at().type != TokenType.Bar) {
                                const prop = this.parse_expr();
                                if (prop.kind != "Identifier") {
                                    console.error("Unexpected token found during parsing! expected func name", this.at());
                                    this.err = true;                                        
                                    return {} as Stmt;
                                }
                                args.push((prop as Identifier).symbol);
                                if (this.at().type == TokenType.Comma) {
                                    this.eat(); // eat the comma
                                } else {
                                    break;
                                }
                            }
                            this.eat(); // eat the closing paren
                        }
                        let body = this.parse_block_stmt(); // eat the variable value
                        return { kind: "FuncStmt",name, args,body } as FuncStmt;
                    }
                    default: {
                        console.error("Unexpected token found during parsing! expected key word (set,if,loop)", this.at());
                        return {} as Stmt;
                    }
                }
            }
            default:
                return this.parse_expr();
        }
        // skip to parse_expr
        // return this.parse_expr();
    }

    // Handle expressions
    private parse_expr(): Expr {
        return this.parse_logical_expr();
    }

    private parse_logical_expr(): Expr {
        let left = this.parse_additive_expr();

        while (this.at().type == TokenType.LogicalOperator) {
            const operator = this.eat().value;
            const right = this.parse_additive_expr();
            left = {
                kind: "LogicalExpr",
                left,
                right,
                operator,
            } as LogicalExpr;
        }

        return left;
    }

    // Handle Addition & Subtraction Operations
    private parse_additive_expr(): Expr {
        let left = this.parse_multiplicitave_expr();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right = this.parse_multiplicitave_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    // Handle Multiplication, Division & Modulo Operations
    private parse_multiplicitave_expr(): Expr {
        let left = this.parse_primary_expr();

        while (
            this.at().value == "/" || this.at().value == "*" || this.at().value == "%"
        ) {
            const operator = this.eat().value;
            const right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    // Orders Of Prescidence
    // AdditiveExpr
    // MultiplicitaveExpr
    // PrimaryExpr
    private parse_func_expr(): Expr {
        this.eat(); // eat the opening paren
        const value = this.eat() // closing paren
        let props = [] as Expr[];
        while (this.at().type != TokenType.CloseBrack) {
            const prop = this.parse_expr();
            props.push(prop);
            if (this.at().type == TokenType.Comma) {
                this.eat(); // eat the comma
            } else {
                break;
            }
        }
        this.eat(); // eat the closing paren
        // console.log("FuncExpr", value, props, this.at());

        // this.parse_primary_expr();
        return { kind: "FuncExpr", funcname: value.value, props } as FuncExpr;
    }

    // Parse Literal Values & Grouping Expressions
    private parse_primary_expr(): Expr {
        const tk = this.at().type;

        // Determine which token we are currently at and return literal value
        switch (tk) {
            // User defined values.
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value } as Identifier;
            // case TokenType.Var | TokenType.Let:
            // Constants and Numeric Constants
            case TokenType.Number:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(this.eat().value),
                } as NumericLiteral;
            case TokenType.String:
                return {
                    kind: "StringLiteral",
                    value: this.eat().value,
                } as StringLiteral;
            // Grouping Expressions
            case TokenType.OpenParen: {
                this.eat(); // eat the opening paren
                const value = this.parse_expr();
                this.expect(
                    TokenType.CloseParen,
                    "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
                ); // closing paren
                return value;
            }

            case TokenType.OpenBrack: {
                return this.parse_func_expr();
            }
            // Unidentified Tokens and Invalid Code Reached
            default:
                console.error("Unexpected token found during parsing!", this.at());
                this.err = true;
                return {} as Expr;
            //   Deno.exit(1);
        }
    }
}