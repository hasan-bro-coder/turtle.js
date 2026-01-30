import {
  BinaryExpr,
  FuncExpr,
  LogicalExpr,
  VarStmt,
  IfStmt,
  LoopStmt,
  FuncStmt,
  Expr,
  Identifier,
  NumericLiteral,
  Program,
  Stmt,
  ForStmt,
  StringLiteral,
  BoolLiteral,
} from "./ast.ts";

import { Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];
  public err = false;
  public errMessage = "";

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF && !this.err;
  }

  private at(idx: number = 0) {
    return this.tokens[0 + idx] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private skipLines() {
    while (this.at().type == TokenType.Line && this.not_eof()) {
      this.eat();
    }
  }

  private expect(type: TokenType): Token {
    const prev = this.tokens[0];
    if (!prev || prev.type != type) {
      this.err = true;
      this.errMessage = `Expected ${type} but Found: ${prev?.type !== undefined ? TokenType[prev.type] : "EOF"} with value "${prev?.value || ""}"\nExpected: ${TokenType[type]}`;
      return {} as Token;
    }
    return this.eat();
  }

  private error(message: string): void {
    this.err = true;
    const current = this.at();
    this.errMessage = `${message}\nAt token: ${current?.type !== undefined ? TokenType[current.type] : "EOF"} with value "${current?.value || ""}"`;
  }

  private parse_expr(): Expr {
    return this.parse_conditional_expr();
  }

  private parse_conditional_expr(): Expr {
    let left = this.parse_logical_expr();
    if (this.err) return {} as Expr;
    while (
      this.at().value == "|" ||
      (this.at().value == "&" && this.not_eof())
    ) {
      const operator = this.eat().value;
      const right = this.parse_logical_expr();
      if (this.err) return {} as Expr;
      left = {
        kind: "LogicalExpr",
        left,
        right,
        operator,
      } as LogicalExpr;
    }
    return left;
  }

  private parse_logical_expr(): Expr {
    let left = this.parse_additive_expr();
    if (this.err) return {} as Expr;
    while (
      this.at().type == TokenType.LogicalOperator &&
      this.at().value != "&" &&
      this.at().value != "|" &&
      this.not_eof()
    ) {
      const operator = this.eat().value;
      const right = this.parse_additive_expr();
      if (this.err) return {} as Expr;
      left = {
        kind: "LogicalExpr",
        left,
        right,
        operator,
      } as LogicalExpr;
    }
    return left;
  }

  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();
    if (this.err) return {} as Expr;
    while (
      (this.at().value == "+" || this.at().value == "-") &&
      this.not_eof()
    ) {
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr();
      if (this.err) return {} as Expr;
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_primary_expr();
    if (this.err) return {} as Expr;
    while (
      (this.at().value == "/" ||
        this.at().value == "*" ||
        this.at().value == "%") &&
      this.not_eof()
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      if (this.err) return {} as Expr;

      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_primary_expr(): Expr {
    if (!this.not_eof()) {
      this.error("Unexpected end of file in expression");
      return {} as Expr;
    }
    const tk = this.at().type;
    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
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
      case TokenType.Bool:
        return {
          kind: "BoolLiteral",
          value: this.eat().value == "true" ? true : false,
        } as BoolLiteral;
      case TokenType.OpenParen: {
        this.eat();
        const value = this.parse_expr();
        if (this.err) return {} as Expr;
        this.expect(TokenType.CloseParen);
        if (this.err) return {} as Expr;
        return value;
      }
      case TokenType.OpenBrack: {
        this.eat();
        console.log("yo");
        const value = this.parse_func_call();
        if (this.err) return {} as Expr;
        this.expect(TokenType.CloseBrack);
        if (this.err) return {} as Expr;
        return value;
      }
      default:
        this.error(`Unexpected token in expression: ${TokenType[tk]}`);
        return {} as Expr;
    }
  }

  private parse_func_call(): Expr {
    const funcname = this.eat().value;
    const args: Expr[] = [];

    while (this.not_eof() && this.at().type != TokenType.Line && this.at().type != TokenType.CloseBrack) {
      const arg = this.parse_expr();
      if (this.err) return {} as Expr;

      args.push(arg);

      if (this.at().type == TokenType.Comma) {
        this.eat();
      } else {
        break;
      }
    }
    return { kind: "FuncExpr", funcname, props: args } as FuncExpr;
  }

  private parse_block_stmt(): Stmt[] {
    const body: Stmt[] = [];
    this.expect(TokenType.Do);
    this.expect(TokenType.Line);
    while (this.not_eof() && this.at().type != TokenType.End) {
      const stmt = this.parse_stmt();
      if (this.err) {
        return [] as Stmt[];
      }
      body.push(stmt);
      this.skipLines();
    }

    this.expect(TokenType.End);
    this.expect(TokenType.Line);
    if (this.err) {
      return [] as Stmt[];
    }

    return body;
  }

  private parse_stmt(): Stmt {
    this.skipLines();

    if (!this.not_eof()) {
      this.error("Unexpected end of file while parsing statement");
      return {} as Stmt;
    }

    switch (this.at().type) {
      case TokenType.Identifier: {
        const name = this.at().value;
        const nextToken = this.at(1);

        if (nextToken && nextToken.type == TokenType.Equals) {
          this.eat();
          this.expect(TokenType.Equals);
          const value = this.parse_expr();
          if (this.err) return {} as Stmt;
          this.skipLines();
          return {
            kind: "VarStmt",
            name,
            value,
          } as VarStmt;
        } else {
          let val = this.parse_func_call();
          this.expect(TokenType.Line);
          return val;
        }
      }

      case TokenType.If: {
        this.eat();
        const condition = this.parse_expr();
        if (this.err) return {} as Stmt;
        const body = this.parse_block_stmt();
        if (this.err) return {} as Stmt;

        let alternate: Stmt[] = [];

        if (this.at().type == TokenType.Else) {
          this.eat(); // eat "else"

          if (this.at().type == TokenType.If) {
            alternate = [this.parse_stmt()];
          } else {
            alternate = this.parse_block_stmt();
          }
        }

        return { kind: "IfStmt", condition, body, alternate } as IfStmt;
      }

      case TokenType.Loop: {
        this.eat();
        const condition = this.parse_expr();
        if (this.err) return {} as Stmt;

        const body = this.parse_block_stmt();
        if (this.err) return {} as Stmt;

        return { kind: "LoopStmt", condition, body } as LoopStmt;
      }
      case TokenType.For: {
        this.eat();
        const name = this.parse_primary_expr();
        const number = this.parse_expr();
        if (this.err) return {} as Stmt;
        const body = this.parse_block_stmt();
        if (this.err) return {} as Stmt;        
        return {
          kind: "ForStmt",
          body,
          varname: (name as Identifier).symbol,
          amount: number,
        } as ForStmt;
      }

      case TokenType.Func: {
        this.eat();
        const name = this.expect(TokenType.Identifier);
        if (this.err) return {} as Stmt;

        const args: string[] = [];

        this.expect(TokenType.OpenParen);
        if (this.err) return {} as Stmt;

        while (this.at().type != TokenType.CloseParen && this.not_eof()) {
          const arg = this.expect(TokenType.Identifier);
          if (this.err) return {} as Stmt;

          args.push(arg.value);

          if (this.at().type == TokenType.Comma) {
            this.eat();
          } else if (this.at().type != TokenType.CloseParen) {
            this.error("Expected ',' or ')' in parameter list");
            return {} as Stmt;
          }
        }
        this.expect(TokenType.CloseParen);
        if (this.err) return {} as Stmt;

        const body = this.parse_block_stmt();
        if (this.err) return {} as Stmt;

        return { kind: "FuncStmt", name: name.value, args, body } as FuncStmt;
      }

      default:
        return this.parse_expr();
    }
  }

  public produceAST(tokens: Token[]): Program {
    this.tokens = tokens;
    const program: Program = {
      kind: "Program",
      body: [],
    } as Program;
    this.skipLines();
    while (this.not_eof()) {
      const stmt = this.parse_stmt();
      if (this.err) {
        break;
      }
      program.body.push(stmt);
      this.skipLines();
    }
    return program;
  }
}