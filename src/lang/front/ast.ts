export type NodeType =
  | "Program"
  | "VarStmt"
  | "BlockStmt"
  | "IfStmt"
  | "LoopStmt"
  | "ForStmt"
  | "FuncStmt"
  | "NumericLiteral"
  | "StringLiteral"
  | "Identifier"
  | "FuncExpr"
  | "BinaryExpr"
  | "LogicalExpr";

/**
 * Statements do not result in a value at runtime.
 They contain one or more expressions internally */
export interface Stmt {
  kind: NodeType;
}

/**
 * Defines a block which contains many statements.
 * -  Only one program will be contained in a file.
 */
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}


export interface VarStmt extends Stmt {
  kind: "VarStmt";
  name: string;
  value: Expr;
}

export interface BlockStmt extends Stmt {
  kind: "BlockStmt";
  body: Stmt[];
}

export interface IfStmt extends Stmt {
  kind: "IfStmt";
  condition: Expr;
  body: BlockStmt;
}

export interface LoopStmt extends Stmt {
  kind: "LoopStmt";
  condition: Expr;
  body: BlockStmt;
}

export interface ForStmt extends Stmt {
  kind: "ForStmt";
  body: BlockStmt;
  varname: string;
  amount: Expr;
}

export interface FuncStmt extends Stmt {
  kind: "FuncStmt";
  name: string;
  args: string[];
  body: BlockStmt;
}

/**  Expressions will result in a value at runtime unlike Statements */
export interface Expr extends Stmt {}

/**
 * A operation with two sides seperated by a operator.
 * Both sides can be ANY Complex Expression.
 * - Supported Operators -> + | - | / | * | %
 */



export interface FuncExpr extends Expr {
    kind: "FuncExpr";
    funcname: string;
    props: Expr[];
}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string; // needs to be of type BinaryOperator
}

export interface LogicalExpr extends Expr {
    kind: "LogicalExpr";
    left: Expr;
    right: Expr;
    operator: string; // needs to be of type BinaryOperator
  }
// LITERAL / PRIMARY EXPRESSION TYPES
/**
 * Represents a user-defined variable or symbol in source.
 */
export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

/**
 * Represents a numeric constant inside the soure code.
 */
export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}
export interface StringLiteral extends Expr {
  kind: "StringLiteral";
  value: string;
}