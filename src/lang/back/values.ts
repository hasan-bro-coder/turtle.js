import { Stmt } from "../front/ast.ts";

export type ValueType = "null" | "number" | "boolean" | "function" | "string";

export interface RuntimeVal {
  type: ValueType;
  value: null | boolean | number | string
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL() {
  return { type: "null", value: null } as NullVal;
}

export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b = true) {
  return { type: "boolean", value: b } as BooleanVal;
}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export function MK_NUMBER(n = 0) {
  return { type: "number", value: n } as NumberVal;
}

export interface StringVal extends RuntimeVal {
  type: "string";
  value: string;
}

export function MK_STRING(n = 0) {
  return { type: "number", value: n } as NumberVal;
}

export interface FuncVal extends RuntimeVal {
  type: "function";
  name: string;
  args: string[];
  body: Stmt[];
  builtin: boolean;
  run?: (args: Promise<RuntimeVal>[]) => Promise<RuntimeVal>;
  value: null
}

// export function MK_FUNC(name: string, body: BlockStmt): FuncVal {
  // return { type: "function", name,body } as FuncVal;
// }