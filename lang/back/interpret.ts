import { BooleanVal, FuncVal, MK_NULL, NumberVal, RuntimeVal, StringVal } from "./values.ts";
import {
    BinaryExpr,
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
    private globalEnv: Environment;

    constructor(env: Environment) {
        this.globalEnv = env;
    }

    public eval_program(program: Program): RuntimeVal {
        let lastEvaluated: RuntimeVal = MK_NULL();
        for (const statement of program.body) {
            if (this.err) {
                break;
            }
            lastEvaluated = this.evaluate(statement);
        }
        return lastEvaluated;
    }

    private eval_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {
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

    private eval_boolean_logical_expr(lhs: NumberVal | BooleanVal, rhs: NumberVal | BooleanVal, operator: string): BooleanVal {
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

    private eval_binary_expr(binop: BinaryExpr): RuntimeVal {
        const lhs = this.evaluate(binop.left);
        const rhs = this.evaluate(binop.right);

        if (lhs.type == "number" && rhs.type == "number") {
            return this.eval_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator);
        }
        if (lhs.type == "string" || rhs.type == "string") {
            let result: string;
            if (binop.operator == "+") {
                result = (lhs as StringVal).value + (rhs as StringVal).value;
            } else {
                this.err = true;
                this.errMessage = "String operator not supported "+ binop.operator;
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

    private eval_var(declaration: VarStmt): RuntimeVal {
        const value = declaration.value ? this.evaluate(declaration.value) : MK_NULL();
        if (this.globalEnv.variables.has(declaration.name)) {
            return this.globalEnv.assignVar(declaration.name, value);
        }
        return this.globalEnv.declareVar(declaration.name, value);
    }

    private eval_if(ifstmt: IfStmt): RuntimeVal {
        const condition = this.evaluate(ifstmt.condition) as BooleanVal;
        if (condition.value) {
            return this.evaluate_body(ifstmt.body);
        }
        return MK_NULL();
    }

    private eval_loop(stmt: LoopStmt): RuntimeVal {
        let condition = this.evaluate(stmt.condition) as BooleanVal;
        let result: RuntimeVal = MK_NULL();
        while (condition.value) {
            result = this.evaluate_body(stmt.body);
            condition = this.evaluate(stmt.condition) as BooleanVal;
        }
        return result;
    }

    private eval_for(stmt: ForStmt): RuntimeVal {
        let condition = this.evaluate(stmt.amount) as NumberVal;
        let result: RuntimeVal = MK_NULL();
        let i = 0;
        this.globalEnv.declareVar(stmt.varname, { value: i, type: "number" } as NumberVal);
        while (i < condition.value) {
            i++;
            result = this.evaluate_body(stmt.body);
            this.globalEnv.assignVar(stmt.varname, { value: i, type: "number" } as NumberVal);
        }
        return result;
    }

    private eval_func_run(stmt: FuncExpr): RuntimeVal {
        let func = this.globalEnv.getFunc(stmt.funcname);
        if (func.builtin && func.run) {
            const evaluatedArgs = stmt.props.map(arg => this.evaluate(arg));
            return func.run(evaluatedArgs);
        }
        if (func.args.length != stmt.props.length) {
            this.errMessage = `Function ${stmt.funcname} expected ${func.args.length} arguments but got ${stmt.props.length}.`;
            this.err = true;
            return MK_NULL();
        }
        func.args.forEach((arg, index) => {
            this.globalEnv.declareVar(arg, this.evaluate(stmt.props[index]));
        });
        return this.evaluate_body(func.body);
    }

    private eval_func(stmt: FuncStmt): RuntimeVal {
        this.globalEnv.setFunc({ type: "function", name: stmt.name, body: stmt.body, args: stmt.args, builtin: false } as FuncVal);
        return MK_NULL();
    }

    private evaluate_body(astNode: Stmt[]): RuntimeVal {
        let result: RuntimeVal = MK_NULL();
        for (const stmt of astNode) {
            if (this.err) {
                break;
            }
            result = this.evaluate(stmt);
        }
        return result;
    }

    public evaluate(astNode: Stmt): RuntimeVal {
        switch (astNode.kind) {
            case "NumericLiteral":
                return { value: ((astNode as NumericLiteral).value), type: "number" } as NumberVal;
            case "StringLiteral":
                return { value: ((astNode as StringLiteral).value), type: "string" } as StringVal;
            case "Identifier":
                return this.eval_identifier(astNode as Identifier);
            case "BinaryExpr":
                return this.eval_binary_expr(astNode as BinaryExpr);
            case "Program":
                return this.eval_program(astNode as Program);
            case "LogicalExpr":
                return this.eval_boolean_logical_expr(
                    this.evaluate((astNode as LogicalExpr).left) as NumberVal | BooleanVal,
                    this.evaluate((astNode as LogicalExpr).right) as NumberVal | BooleanVal,
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
                return this.eval_func_run(astNode as FuncExpr);
            default:
                this.errMessage = "This AST Node has not yet been setup for interpretation " + astNode;
                return MK_NULL();
        }
    }
}

export default Interpreter;
