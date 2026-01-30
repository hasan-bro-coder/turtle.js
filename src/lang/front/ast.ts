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
  | "BoolLiteral"
  | "Identifier"
  | "FuncExpr"
  | "BinaryExpr"
  | "LogicalExpr"
  | "ConditionalExpr"
  ;
export interface Stmt {
  kind: NodeType;
}


export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}


export interface VarStmt extends Stmt {
  kind: "VarStmt";
  name: string;
  value: Expr;
}


export interface IfStmt extends Stmt {
  kind: "IfStmt";
  condition: Expr;
  body: Stmt[];
  alternate?: Stmt[];
}

export interface LoopStmt extends Stmt {
  kind: "LoopStmt";
  condition: Expr;
  body: Stmt[];
}

export interface ForStmt extends Stmt {
  kind: "ForStmt";
  body: Stmt[];
  varname: string;
  amount: Expr;
}

export interface FuncStmt extends Stmt {
  kind: "FuncStmt";
  name: string;
  args: string[];
  body: Stmt[];
}

export interface Expr extends Stmt {}


export interface FuncExpr extends Expr {
    kind: "FuncExpr";
    funcname: string;
    props: Expr[];
}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface LogicalExpr extends Expr {
    kind: "LogicalExpr";
    left: Expr;
    right: Expr;
    operator: string;
  }

export interface ConditionalExpr extends Expr {
    kind: "ConditionalExpr";
    left: Expr;
    right: Expr;
    operator: string; 
  }

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}
export interface StringLiteral extends Expr {
  kind: "StringLiteral";
  value: string;
}
export interface BoolLiteral extends Expr {
  kind: "BoolLiteral";
  value: boolean;
}