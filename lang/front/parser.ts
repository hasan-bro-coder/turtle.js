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
    while (this.at().value == "|" || this.at().value == "&" && this.not_eof()) {
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
    while (this.at().type == TokenType.LogicalOperator && (this.at().value != "&" && this.at().value != "|") && this.not_eof()) {
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
      default:
        this.error(`Unexpected token in expression: ${TokenType[tk]}`);
        return {} as Expr;
    }
  }

  private parse_func_call(): Expr {
    const funcname = this.eat().value;
    const args: Expr[] = [];

    while (this.not_eof() && this.at().type != TokenType.Line) {
      const arg = this.parse_expr();
      if (this.err) return {} as Expr;

      args.push(arg);

      if (this.at().type == TokenType.Comma) {
        this.eat();
      } else {
        break;
      }
    }
    this.expect(TokenType.Line);
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
          return this.parse_func_call();
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

        case TokenType.Func: {
          this.eat();
          const name = this.expect(
            TokenType.Identifier,
          );
          if (this.err) return {} as Stmt;

          const args: string[] = [];

          this.expect(TokenType.OpenParen);
          if (this.err) return {} as Stmt;

          while (this.at().type != TokenType.CloseParen && this.not_eof()) {
            const arg = this.expect(
              TokenType.Identifier,
            );
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

  //     private parse_block_stmt(): BlockStmt {
  //         const body: Stmt[] = [];

  //         this.skipLines();

  //         while (this.not_eof() && this.at().type != TokenType.End) {
  //             const stmt = this.parse_stmt();
  //             if (this.err) {
  //                 return { kind: "BlockStmt", body: [] } as BlockStmt;
  //             }
  //             body.push(stmt);
  //             this.skipLines();
  //         }

  //         this.expect(TokenType.End, "Block statement must end with 'end' keyword");
  //         if (this.err) {
  //             return { kind: "BlockStmt", body: [] } as BlockStmt;
  //         }

  //         return { kind: "BlockStmt", body } as BlockStmt;
  //     }

  //     private parse_stmt(): Stmt {
  //         this.skipLines();

  //         if (!this.not_eof()) {
  //             this.error("Unexpected end of file while parsing statement");
  //             return {} as Stmt;
  //         }

  //         switch (this.at().type) {
  //             case TokenType.Identifier: {
  //                 // Check next token to determine if it's assignment or function call
  //                 const peekIndex = this.tokens.findIndex(t => t.type !== TokenType.Line, 1);
  //                 const nextToken = peekIndex !== -1 ? this.tokens[peekIndex] : null;

  //                 if (nextToken && nextToken.type == TokenType.Equals) {
  //                     // Variable assignment: I = 0
  //                     const name = this.eat().value;
  //                     this.skipLines();
  //                     this.eat(); // eat equals
  //                     this.skipLines();
  //                     const value = this.parse_expr();
  //                     if (this.err) return {} as Stmt;

  //                     return {
  //                         kind: "VarStmt",
  //                         name,
  //                         value,
  //                     } as VarStmt;
  //                 } else {
  //                     // Function call: forward 100
  //                     return this.parse_func_call();
  //                 }
  //             }

  //             case TokenType.If: {
  //                 this.eat(); // eat 'if'
  //                 this.skipLines();
  //                 const condition = this.parse_expr();
  //                 if (this.err) return {} as Stmt;

  //                 this.skipLines();
  //                 this.expect(TokenType.Do, "Expected 'start' keyword after if condition");
  //                 if (this.err) return {} as Stmt;

  //                 const body = this.parse_block_stmt();
  //                 if (this.err) return {} as Stmt;

  //                 this.skipLines();

  //                 // Check for else clause
  //                 if (this.at().type == TokenType.Else) {
  //                     this.eat(); // eat 'else'
  //                     this.skipLines();
  //                     this.expect(TokenType.Do, "Expected 'start' keyword after else");
  //                     if (this.err) return {} as Stmt;

  //                     const elseBody = this.parse_block_stmt();
  //                     if (this.err) return {} as Stmt;

  //                     // For now, we'll need to extend the AST to support else
  //                     // This is a simplified version
  //                     return { kind: "IfStmt", condition, body } as IfStmt;
  //                 }

  //                 return { kind: "IfStmt", condition, body } as IfStmt;
  //             }

  //             case TokenType.Loop: {
  //                 this.eat(); // eat 'loop'
  //                 this.skipLines();
  //                 const condition = this.parse_expr();
  //                 if (this.err) return {} as Stmt;

  //                 this.skipLines();
  //                 this.expect(TokenType.Do, "Expected 'start' keyword after loop condition");
  //                 if (this.err) return {} as Stmt;

  //                 const body = this.parse_block_stmt();
  //                 if (this.err) return {} as Stmt;

  //                 return { kind: "LoopStmt", condition, body } as LoopStmt;
  //             }

  //             case TokenType.Func: {
  //                 this.eat(); // eat 'func'
  //                 this.skipLines();

  //                 const name = this.expect(TokenType.Identifier, "Expected function name after 'func'");
  //                 if (this.err) return {} as Stmt;

  //                 const args: string[] = [];

  //                 this.skipLines();
  //                 this.expect(TokenType.OpenParen, "Expected '(' after function name");
  //                 if (this.err) return {} as Stmt;

  //                 this.skipLines();

  //                 while (this.at().type != TokenType.CloseParen && this.not_eof()) {
  //                     const arg = this.expect(TokenType.Identifier, "Expected parameter name");
  //                     if (this.err) return {} as Stmt;

  //                     args.push(arg.value);

  //                     this.skipLines();

  //                     if (this.at().type == TokenType.Comma) {
  //                         this.eat();
  //                         this.skipLines();
  //                     } else if (this.at().type != TokenType.CloseParen) {
  //                         this.error("Expected ',' or ')' in parameter list");
  //                         return {} as Stmt;
  //                     }
  //                 }

  //                 this.expect(TokenType.CloseParen, "Expected ')' after parameters");
  //                 if (this.err) return {} as Stmt;

  //                 this.skipLines();
  //                 this.expect(TokenType.Do, "Expected 'start' keyword after function declaration");
  //                 if (this.err) return {} as Stmt;

  //                 const body = this.parse_block_stmt();
  //                 if (this.err) return {} as Stmt;

  //                 return { kind: "FuncStmt", name: name.value, args, body } as FuncStmt;
  //             }

  //             default:
  //                 return this.parse_expr();
  //         }
  //     }

  //     private parse_expr(): Expr {
  //         return this.parse_logical_expr();
  //     }

  //     private parse_logical_expr(): Expr {
  //         let left = this.parse_additive_expr();
  //         if (this.err) return {} as Expr;

  //         this.skipLines();

  //         while (this.at().type == TokenType.LogicalOperator && this.not_eof()) {
  //             const operator = this.eat().value;
  //             this.skipLines();
  //             const right = this.parse_additive_expr();
  //             if (this.err) return {} as Expr;

  //             left = {
  //                 kind: "LogicalExpr",
  //                 left,
  //                 right,
  //                 operator,
  //             } as LogicalExpr;

  //             this.skipLines();
  //         }

  //         return left;
  //     }

  //     private parse_additive_expr(): Expr {
  //         let left = this.parse_multiplicitave_expr();
  //         if (this.err) return {} as Expr;

  //         this.skipLines();

  //         while ((this.at().value == "+" || this.at().value == "-") && this.not_eof()) {
  //             const operator = this.eat().value;
  //             this.skipLines();
  //             const right = this.parse_multiplicitave_expr();
  //             if (this.err) return {} as Expr;

  //             left = {
  //                 kind: "BinaryExpr",
  //                 left,
  //                 right,
  //                 operator,
  //             } as BinaryExpr;

  //             this.skipLines();
  //         }

  //         return left;
  //     }

  //     private parse_multiplicitave_expr(): Expr {
  //         let left = this.parse_primary_expr();
  //         if (this.err) return {} as Expr;

  //         this.skipLines();

  //         while (
  //             (this.at().value == "/" || this.at().value == "*" || this.at().value == "%")
  //             && this.not_eof()
  //         ) {
  //             const operator = this.eat().value;
  //             this.skipLines();
  //             const right = this.parse_primary_expr();
  //             if (this.err) return {} as Expr;

  //             left = {
  //                 kind: "BinaryExpr",
  //                 left,
  //                 right,
  //                 operator,
  //             } as BinaryExpr;

  //             this.skipLines();
  //         }

  //         return left;
  //     }

  //     private parse_func_call(): Expr {
  //         const funcname = this.eat().value; // function name
  //         const args: Expr[] = [];

  //         this.skipLines();

  //         // Parse arguments (e.g., "forward 100" or "hello message")
  //         // Continue parsing until we hit a keyword, newline, or end
  //         while (this.not_eof() &&
  //                this.at().type != TokenType.Identifier &&
  //                this.at().type != TokenType.If &&
  //                this.at().type != TokenType.Else &&
  //                this.at().type != TokenType.Loop &&
  //                this.at().type != TokenType.Func &&
  //                this.at().type != TokenType.End &&
  //                this.at().type != TokenType.Line &&
  //                this.at().type != TokenType.EOF) {

  //             const arg = this.parse_primary_expr();
  //             if (this.err) return {} as Expr;

  //             args.push(arg);

  //             this.skipLines();

  //             if (this.at().type == TokenType.Comma) {
  //                 this.eat();
  //                 this.skipLines();
  //             } else {
  //                 break;
  //             }
  //         }

  //         return { kind: "FuncExpr", funcname, props: args } as FuncExpr;
  //     }

  //     private parse_primary_expr(): Expr {
  //         this.skipLines();

  //         if (!this.not_eof()) {
  //             this.error("Unexpected end of file in expression");
  //             return {} as Expr;
  //         }

  //         const tk = this.at().type;

  //         switch (tk) {
  //             case TokenType.Identifier:
  //                 return { kind: "Identifier", symbol: this.eat().value } as Identifier;

  //             case TokenType.Number:
  //                 return {
  //                     kind: "NumericLiteral",
  //                     value: parseFloat(this.eat().value),
  //                 } as NumericLiteral;

  //             case TokenType.String:
  //                 return {
  //                     kind: "StringLiteral",
  //                     value: this.eat().value,
  //                 } as StringLiteral;

  //             case TokenType.OpenParen: {
  //                 this.eat();
  //                 this.skipLines();
  //                 const value = this.parse_expr();
  //                 if (this.err) return {} as Expr;

  //                 this.skipLines();
  //                 this.expect(
  //                     TokenType.CloseParen,
  //                     "Expected closing parenthesis ')'"
  //                 );
  //                 if (this.err) return {} as Expr;

  //                 return value;
  //             }

  //             default:
  //                 this.error(`Unexpected token in expression: ${TokenType[tk]}`);
  //                 return {} as Expr;
  //         }
  //     }
}

//   public produceAST(tokens: Token[]): Program {
//     //   this.tokens = tokenize(sourceCode);

//     this.tokens = tokens;

//     const program: Program = {
//       kind: "Program",

//       body: [],
//     };

//     // Parse until end of file

//     while (this.not_eof()) {
//       program.body.push(this.parse_stmt());
//     }

//     return program;
//   }

//   private parse_block_stmt(): BlockStmt {
//     // this.eat(); // eat the opening brace

//     let props = [] as Stmt[];

//     while (this.at().type != TokenType.CloseBrace && this.not_eof()) {
//       // console.log(this.at());

//       const prop = this.parse_stmt();

//       props.push(prop);

//       // if (this.at().type == TokenType.Comma) {

//       // this.eat(); // eat the comma

//       // } else {

//       // break;

//       // }
//     }

//     this.eat();

//     return { kind: "BlockStmt", body: props } as BlockStmt;
//   }

//   // Handle complex statement types

//   private parse_stmt(): Stmt {
//     switch (this.at().type) {
//       case TokenType.OpenBrace: {
//         this.eat(); // eat the opening paren

//         switch (this.at().type) {
//           case TokenType.Set: {
//             this.eat(); // eat the var keyword

//             const varName = this.eat().value; // eat the variable name

//             this.expect(
//               TokenType.Equals,
//               "Unexpected token found Expected equals.",
//             ); // closing brace

//             let value = this.parse_expr(); // eat the variable value

//             this.expect(
//               TokenType.CloseBrace,
//               "Unexpected token found inside parenthesised expression. Expected closing brace.",
//             ); // closing brace

//             return {
//               kind: "VarStmt",

//               name: varName,

//               value,
//             } as VarStmt;
//           }

//           case TokenType.If: {
//             this.eat(); // eat the var keyword

//             let ifCondition = this.parse_expr(); // eat the variable value

//             let ifBody = this.parse_block_stmt(); // eat the variable value

//             return {
//               kind: "IfStmt",
//               condition: ifCondition,
//               body: ifBody,
//             } as IfStmt;
//           }

//           case TokenType.Loop: {
//             this.eat(); // eat the var keyword

//             let loopCondition = this.parse_expr(); // eat the variable value

//             let loopBody = this.parse_block_stmt(); // eat the variable value

//             return {
//               kind: "LoopStmt",
//               condition: loopCondition,
//               body: loopBody,
//             } as LoopStmt;
//           }

//           case TokenType.For: {
//             this.eat(); // eat the var keyword

//             let varname = this.expect(
//               TokenType.Identifier,

//               "Unexpected token found during parsing! expected var name in for loop",
//             ).value; // eat the variable name

//             let amount = this.parse_expr(); // eat the variable name

//             let loopBody = this.parse_block_stmt(); // eat the variable value

//             return {
//               kind: "ForStmt",
//               body: loopBody,
//               varname,
//               amount,
//             } as ForStmt;
//           }

//           case TokenType.Func: {
//             this.eat(); // eat the var keyword

//             let name = this.expect(
//               TokenType.Identifier,
//               "Unexpected token found during parsing! expected func name",
//             ).value; // eat the variable value

//             let args = [] as string[];

//             if (this.at().type == TokenType.Bar) {
//               this.eat(); // eat the opening paren

//               while (this.at().type != TokenType.Bar) {
//                 const prop = this.parse_expr();

//                 if (prop.kind != "Identifier") {
//                   console.error(
//                     "Unexpected token found during parsing! expected func name",
//                     this.at(),
//                   );

//                   this.err = true;

//                   return {} as Stmt;
//                 }

//                 args.push((prop as Identifier).symbol);

//                 if (this.at().type == TokenType.Comma) {
//                   this.eat(); // eat the comma
//                 } else {
//                   break;
//                 }
//               }

//               this.eat(); // eat the closing paren
//             }

//             let body = this.parse_block_stmt(); // eat the variable value

//             return { kind: "FuncStmt", name, args, body } as FuncStmt;
//           }

//           default: {
//             console.error(
//               "Unexpected token found during parsing! expected key word (set,if,loop)",
//               this.at(),
//             );

//             return {} as Stmt;
//           }
//         }
//       }

//       default:
//         return this.parse_expr();
//     }

//     // skip to parse_expr

//     // return this.parse_expr();
//   }

//   // Handle expressions

//   private parse_expr(): Expr {
//     return this.parse_logical_expr();
//   }

//   private parse_logical_expr(): Expr {
//     let left = this.parse_additive_expr();

//     while (this.at().type == TokenType.LogicalOperator) {
//       const operator = this.eat().value;

//       const right = this.parse_additive_expr();

//       left = {
//         kind: "LogicalExpr",

//         left,

//         right,

//         operator,
//       } as LogicalExpr;
//     }

//     return left;
//   }

//   // Handle Addition & Subtraction Operations

//   private parse_additive_expr(): Expr {
//     let left = this.parse_multiplicitave_expr();

//     while (this.at().value == "+" || this.at().value == "-") {
//       const operator = this.eat().value;

//       const right = this.parse_multiplicitave_expr();

//       left = {
//         kind: "BinaryExpr",

//         left,

//         right,

//         operator,
//       } as BinaryExpr;
//     }

//     return left;
//   }

//   // Handle Multiplication, Division & Modulo Operations

//   private parse_multiplicitave_expr(): Expr {
//     let left = this.parse_primary_expr();

//     while (
//       this.at().value == "/" ||
//       this.at().value == "*" ||
//       this.at().value == "%"
//     ) {
//       const operator = this.eat().value;

//       const right = this.parse_primary_expr();

//       left = {
//         kind: "BinaryExpr",

//         left,

//         right,

//         operator,
//       } as BinaryExpr;
//     }

//     return left;
//   }

//   // Orders Of Prescidence

//   // AdditiveExpr

//   // MultiplicitaveExpr

//   // PrimaryExpr

//   private parse_func_expr(): Expr {
//     this.eat(); // eat the opening paren

//     const value = this.eat(); // closing paren

//     let props = [] as Expr[];

//     while (this.at().type != TokenType.CloseBrack) {
//       const prop = this.parse_expr();

//       props.push(prop);

//       if (this.at().type == TokenType.Comma) {
//         this.eat(); // eat the comma
//       } else {
//         break;
//       }
//     }

//     this.eat(); // eat the closing paren

//     // console.log("FuncExpr", value, props, this.at());

//     // this.parse_primary_expr();

//     return { kind: "FuncExpr", funcname: value.value, props } as FuncExpr;
//   }

//   // Parse Literal Values & Grouping Expressions

//   private parse_primary_expr(): Expr {
//     const tk = this.at().type;

//     // Determine which token we are currently at and return literal value

//     switch (tk) {
//       // User defined values.

//       case TokenType.Identifier:
//         return { kind: "Identifier", symbol: this.eat().value } as Identifier;

//       // case TokenType.Var | TokenType.Let:

//       // Constants and Numeric Constants

//       case TokenType.Number:
//         return {
//           kind: "NumericLiteral",

//           value: parseFloat(this.eat().value),
//         } as NumericLiteral;

//       case TokenType.String:
//         return {
//           kind: "StringLiteral",

//           value: this.eat().value,
//         } as StringLiteral;

//       // Grouping Expressions

//       case TokenType.OpenParen: {
//         this.eat(); // eat the opening paren

//         const value = this.parse_expr();

//         this.expect(
//           TokenType.CloseParen,

//           "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
//         ); // closing paren

//         return value;
//       }

//       case TokenType.OpenBrack: {
//         return this.parse_func_expr();
//       }

//       // Unidentified Tokens and Invalid Code Reached

//       default:
//         console.error("Unexpected token found during parsing!", this.at());

//         this.err = true;

//         return {} as Expr;

//       //   Deno.exit(1);
//     }
//   }
// }
