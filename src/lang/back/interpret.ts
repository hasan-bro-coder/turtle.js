import {
  BooleanVal,
  FuncVal,
  MK_NULL,
  NumberVal,
  RuntimeVal,
  StringVal,
} from "./values.ts";
import {
  BinaryExpr,
  BoolLiteral,
  ForStmt,
  FuncExpr,
  FuncStmt,
  Identifier,
  IfStmt,
  LogicalExpr,
  LoopStmt,
  NumericLiteral,
  Program,
  Stmt,
  StringLiteral,
  VarStmt,
} from "../front/ast.ts";
import Environment from "./env.ts";

class Interpreter {
  public err: boolean = false;
  public errMessage: string = "";
  public globalEnv: Environment;
  private interrupted: boolean = false;
  private isRunning: boolean = false;

  constructor(env: Environment) {
    this.globalEnv = env;
  }

  public interrupt(): void {
    this.interrupted = true;
    console.log("Interpreter: Program interrupted");
  }

  /**
   * Reset the interpreter state for a new program
   */
  public reset(): void {
    this.err = false;
    this.errMessage = "";
    this.interrupted = false;
  }

  /**
   * Check if execution should stop
   */
  private shouldStop(): boolean {
    return this.err || this.interrupted;
  }

  /**
   * Check if interpreter is currently running a program
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public async eval_program(program: Program): Promise<RuntimeVal> {
    // If already running, interrupt the previous execution
    if (this.isRunning) {
      console.log(
        "Interpreter: Already running, interrupting previous program",
      );
      this.interrupt();
      // Give it a moment to stop
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    this.reset(); // Reset state at start of new program
    this.isRunning = true;

    let lastEvaluated: RuntimeVal = MK_NULL();

    try {
      for (const statement of program.body) {
        if (this.shouldStop()) {
          console.log("Interpreter: Execution stopped");
          break;
        }
        lastEvaluated = await this.evaluate(statement);
      }
    } finally {
      this.isRunning = false;
    }

    return lastEvaluated;
  }

  private eval_numeric_binary_expr(
    lhs: NumberVal,
    rhs: NumberVal,
    operator: string,
  ): NumberVal {
    let result: number;
    if (operator == "+") {
      result = lhs.value + rhs.value;
    } else if (operator == "-") {
      result = lhs.value - rhs.value;
    } else if (operator == "*") {
      result = lhs.value * rhs.value;
    } else if (operator == "/") {
      result = lhs.value / rhs.value;
    } else {
      result = lhs.value % rhs.value;
    }
    return { value: result, type: "number" };
  }

  private eval_boolean_logical_expr(
    lhs: NumberVal | BooleanVal,
    rhs: NumberVal | BooleanVal,
    operator: string,
  ): BooleanVal {
    let result: boolean = false;
    if (operator == "==") {
      result = lhs.value == rhs.value;
    } else if (operator == ">") {
      result = lhs.value > rhs.value;
    } else if (operator == "<") {
      result = lhs.value < rhs.value;
    } else if (operator == "!=") {
      result = lhs.value != rhs.value;
    }
    return { value: result } as BooleanVal;
  }

  private async eval_binary_expr(binop: BinaryExpr): Promise<RuntimeVal> {
    const lhs = await this.evaluate(binop.left);
    const rhs = await this.evaluate(binop.right);

    if (lhs.type == "number" && rhs.type == "number") {
      return this.eval_numeric_binary_expr(
        lhs as NumberVal,
        rhs as NumberVal,
        binop.operator,
      );
    }
    if (lhs.type == "string" || rhs.type == "string") {
      let result: string;
      if (binop.operator == "+") {
        result = (lhs as StringVal).value + (rhs as StringVal).value;
      } else {
        this.err = true;
        this.errMessage = "String operator not supported " + binop.operator;
        return MK_NULL();
      }
      return { value: result, type: "string" } as StringVal;
    }

    return MK_NULL();
  }

  private eval_identifier(ident: Identifier): RuntimeVal {
    const val = this.globalEnv.lookupVar(ident.symbol);
    return val;
  }

  private async eval_var(declaration: VarStmt): Promise<RuntimeVal> {
    const value = declaration.value
      ? await this.evaluate(declaration.value)
      : MK_NULL();
    if (this.globalEnv.variables.has(declaration.name)) {
      return this.globalEnv.assignVar(declaration.name, value);
    }
    return this.globalEnv.declareVar(declaration.name, value);
  }

  private async eval_if(ifstmt: IfStmt): Promise<RuntimeVal> {
    const condition = (await this.evaluate(ifstmt.condition)) as BooleanVal;
    if (condition.value) {
      return await this.evaluate_body(ifstmt.body);
    } else if (ifstmt.alternate) {
      return await this.evaluate_body(ifstmt.alternate);
    }
    return MK_NULL();
  }

  private async eval_loop(stmt: LoopStmt): Promise<RuntimeVal> {
    let condition = (await this.evaluate(stmt.condition)) as BooleanVal;
    console.log(condition);

    let result: RuntimeVal = MK_NULL();
    while (condition.value && !this.shouldStop()) {
      result = await this.evaluate_body(stmt.body);
      condition = (await this.evaluate(stmt.condition)) as BooleanVal;
    }
    return result;
  }

  private async eval_for(stmt: ForStmt): Promise<RuntimeVal> {
    let condition = (await this.evaluate(stmt.amount)) as NumberVal;
    let result: RuntimeVal = MK_NULL();
    let i = 0;
    let value = {
      value: i,
      type: "number",
    } as NumberVal
    if (this.globalEnv.variables.has(stmt.varname)) {
      this.globalEnv.assignVar(stmt.varname, value);
    }else{
      this.globalEnv.declareVar(stmt.varname, value);
    }
    while (i < condition.value && !this.shouldStop()) {
      i++;
      result = await this.evaluate_body(stmt.body);
      this.globalEnv.assignVar(stmt.varname, {
        value: i,
        type: "number",
      } as NumberVal);
    }
    return result;
  }

  public async eval_func_run(stmt: FuncExpr): Promise<RuntimeVal> {
    let func = this.globalEnv.getFunc(stmt.funcname);
    if (func.builtin && func.run) {
      const evaluatedArgs = stmt.props.map(
        async (arg) => await this.evaluate(arg),
      );
      return await func.run(evaluatedArgs);
    }
    if (func.args.length != stmt.props.length) {
      this.errMessage = `Function ${stmt.funcname} expected ${func.args.length} arguments but got ${stmt.props.length}.`;
      this.err = true;
      return MK_NULL();
    }
    func.args.forEach(async (arg, index) => {
      this.globalEnv.declareVar(arg, await this.evaluate(stmt.props[index]));
    });
    return this.evaluate_body(func.body);
  }

  private eval_func(stmt: FuncStmt): RuntimeVal {
    this.globalEnv.setFunc({
      type: "function",
      name: stmt.name,
      body: stmt.body,
      args: stmt.args,
      builtin: false,
    } as FuncVal);
    return MK_NULL();
  }

  private async evaluate_body(astNode: Stmt[]): Promise<RuntimeVal> {
    let result: RuntimeVal = MK_NULL();
    for (const stmt of astNode) {
      if (this.shouldStop()) {
        break;
      }
      result = await this.evaluate(stmt);
    }
    return result;
  }

  public async evaluate(astNode: Stmt): Promise<RuntimeVal> {
    // Check for interruption before evaluating each statement
    if (this.shouldStop()) {
      return MK_NULL();
    }

    switch (astNode.kind) {
      case "NumericLiteral":
        return {
          value: (astNode as NumericLiteral).value,
          type: "number",
        } as NumberVal;
      case "StringLiteral":
        return {
          value: (astNode as StringLiteral).value,
          type: "string",
        } as StringVal;
      case "BoolLiteral":
        return {
          value: (astNode as BoolLiteral).value,
          type: "boolean",
        } as BooleanVal;
      case "Identifier":
        return this.eval_identifier(astNode as Identifier);
      case "BinaryExpr":
        return this.eval_binary_expr(astNode as BinaryExpr);
      case "Program":
        return this.eval_program(astNode as Program);
      case "LogicalExpr":
        return this.eval_boolean_logical_expr(
          (await this.evaluate((astNode as LogicalExpr).left)) as
            | NumberVal
            | BooleanVal,
          (await this.evaluate((astNode as LogicalExpr).right)) as
            | NumberVal
            | BooleanVal,
          (astNode as LogicalExpr).operator,
        );
      case "VarStmt":
        return this.eval_var(astNode as VarStmt);
      case "IfStmt":
        return this.eval_if(astNode as IfStmt);
      case "LoopStmt":
        return this.eval_loop(astNode as LoopStmt);
      case "ForStmt":
        return this.eval_for(astNode as ForStmt);
      case "FuncStmt":
        return this.eval_func(astNode as FuncStmt);
      case "FuncExpr":
        return await this.eval_func_run(astNode as FuncExpr);
      // default:
      // this.errMessage = "This AST Node has not yet been setup for interpretation " + astNode;
    }
    return MK_NULL();
  }
}

export default Interpreter;
