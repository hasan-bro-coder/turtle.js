import Parser from "./front/parser.ts";
import Environment from "./back/env.ts";
import { evaluate } from "./back/interpret.ts";
import { MK_BOOL, MK_NULL, MK_NUMBER } from "./back/values.ts";
import { tokenize } from "./front/lexer.ts";

// repl();

export function run(code: string,env: Environment) {
    console.log("code: ", code)
    let tokens = tokenize(code)
    console.dir(tokens)
    console.log("--------tokens--------");
    
    let parser = new Parser()
    let ast = parser.produceAST(tokens)
    console.dir(ast)

    console.log("----------ast---------");


    // Create Default Global Enviornment
    env.declareVar("x", MK_NUMBER(100));
    env.declareVar("true", MK_BOOL(true));
    env.declareVar("false", MK_BOOL(false));
    env.declareVar("null", MK_NULL());

    // INITIALIZE REPL
    // console.log("\nRepl v0.1");

    // Continue Repl Until User Stops Or Types `exit`
    // while (true) {
    //     const input = prompt("> ");
    //     // Check for no user input or exit keyword.
    //     if (!input || input.includes("exit")) {
    //         Deno.exit(1);
    //     }

    //     // Produce AST From sourc-code
    //     const program = parser.produceAST(input);

    const result = evaluate(ast, env);
    console.log(result);
    console.log("----------result---------");

    // }
}