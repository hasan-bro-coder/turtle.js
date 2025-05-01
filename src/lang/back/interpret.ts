import { BooleanVal, FuncVal, MK_NULL, NullVal, NumberVal, RuntimeVal, StringVal } from "./values.ts";
import {
    BinaryExpr,
    BlockStmt,
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


var err = false;

export function eval_program(program: Program, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = MK_NULL();
    for (const statement of program.body) {
        if (err) {
            break;
        }
        lastEvaluated = evaluate(statement, env);
    }
    return lastEvaluated;
}

/**
 * Evaulate pure numeric operations with binary operators.
 */
function eval_numeric_binary_expr(
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
        // TODO: Division by zero checks
        result = lhs.value / rhs.value;
    } else {
        result = lhs.value % rhs.value;
    }

    return { value: result, type: "number" };
}

function eval_boolean_logical_expr(
    lhs: NumberVal|BooleanVal,
    rhs: NumberVal|BooleanVal,
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
        // TODO: Division by zero checks
        result = lhs.value != rhs.value;
    } 
    // else {
        // result = lhs.value % rhs.value;
    // }

    return { value: result } as BooleanVal;
}
/**
 * Evaulates expressions following the binary operation type.
 */
function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    // Only currently support numeric operations
    if (lhs.type == "number" && rhs.type == "number") {
        return eval_numeric_binary_expr(
            lhs as NumberVal,
            rhs as NumberVal,
            binop.operator,
        );
    }

    // One or both are NULL
    return MK_NULL();
}

function eval_identifier(ident: Identifier, env: Environment): RuntimeVal {
    const val = env.lookupVar(ident.symbol);
    return val;
}

function eval_var(
    declaration: VarStmt,
    env: Environment,
  ): RuntimeVal {
    const value = declaration.value
      ? evaluate(declaration.value, env)
      : MK_NULL();
    if (env.variables.has(declaration.name)){
        return env.assignVar(declaration.name, value);
    }
    return env.declareVar(declaration.name, value);
  }

function eval_if(ifstmt: IfStmt, env: Environment): RuntimeVal {    
    const condition = evaluate(ifstmt.condition, env) as BooleanVal;
    
    if (condition.value) {
        return evaluate(ifstmt.body, env);
    }
    return MK_NULL();
}

function eval_loop(stmt: LoopStmt, env: Environment): RuntimeVal {
    let condition = evaluate(stmt.condition, env) as BooleanVal;
    let result: RuntimeVal = MK_NULL();
    while(condition.value) {
        result = evaluate(stmt.body, env);
        // console.log("Loop body", result);
        
        condition = evaluate(stmt.condition, env) as BooleanVal;
        // console.log("Loop condition", condition.value);
        
    }
    return result;
}

function eval_for(stmt: ForStmt, env: Environment): RuntimeVal {
    let condition = evaluate(stmt.amount, env) as NumberVal;
    let result: RuntimeVal = MK_NULL();
    let i = 0
    env.declareVar(stmt.varname, {value: i, type: "number"} as NumberVal)
    while(i < condition.value) {
        i++;
        result = evaluate(stmt.body, env);
        env.assignVar(stmt.varname, {value: i, type: "number"} as NumberVal)
    }
    return result;
}

function eval_func_run(stmt: FuncExpr, env: Environment): RuntimeVal {
    let func = env.getFunc(stmt.funcname)
    if (func.builtin && func.run) {
        const evaluatedArgs = stmt.props.map(arg => evaluate(arg, env));
        return func.run(evaluatedArgs);
    }
    if (func.args.length != stmt.props.length) {
        console.error(`Function ${stmt.funcname} expected ${func.args.length} arguments but got ${stmt.props.length}.`);
        err = true;
        return MK_NULL();
    }
    func.args.forEach((arg, index) => {
        env.declareVar(arg, evaluate(stmt.props[index], env));
    });
    return evaluate(func.body, env);
}


function eval_func(stmt: FuncStmt, env: Environment): RuntimeVal {
    env.setFunc({type: "function",name:stmt.name,body:stmt.body,args: stmt.args,builtin: false} as FuncVal)
    // let result: RuntimeVal = MK_NULL();
    // while(condition.value) {
    // let result = evaluate(stmt.body, env);

        
        // condition = evaluate(stmt.condition, env) as BooleanVal;
        
    // }
    return MK_NULL();
}

let new_env = true;
function eval_body(body: BlockStmt, env: Environment): RuntimeVal {
    let scope: Environment 
    // = new Environment(env);
    if (new_env) {
      scope = new Environment(env);
    } else {
      scope = env;
    }
    let result: RuntimeVal = MK_NULL();
    for (const stmt of body.body) {
    //   if (!this.return) {
        result = evaluate(stmt, scope);
    //   }
    }
    return result;
  }

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
    switch (astNode.kind) {
        case "NumericLiteral":
            return {
                value: ((astNode as NumericLiteral).value),
                type: "number",
            } as NumberVal;
        case "StringLiteral":
            return {
                value: ((astNode as StringLiteral).value),
                type: "string",
            } as StringVal;
        case "Identifier":
            return eval_identifier(astNode as Identifier, env);
        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr, env);
        case "Program":
            return eval_program(astNode as Program, env);
        case "LogicalExpr":
            return eval_boolean_logical_expr(
                evaluate((astNode as LogicalExpr).left, env) as NumberVal | BooleanVal,
                evaluate((astNode as LogicalExpr).right, env) as NumberVal | BooleanVal,
                (astNode as LogicalExpr).operator,
            );
        case "VarStmt":
            return eval_var(astNode as VarStmt, env);
        case "IfStmt":
            return eval_if(astNode as IfStmt, env);
        case "BlockStmt":
            return eval_body(astNode as BlockStmt, env);
        case "LoopStmt":
            return eval_loop(astNode as LoopStmt, env);
        case "ForStmt":
            return eval_for(astNode as ForStmt, env);
        case "FuncStmt":
            return eval_func(astNode as FuncStmt, env);
        case "FuncExpr":
            return eval_func_run(astNode as FuncExpr, env);
        // Handle unimplimented ast types as error.
        default:
            console.error(
                "This AST Node has not yet been setup for interpretation.",
                astNode,
            );
            // Deno.exit(0);
            return MK_NULL();
    }
}