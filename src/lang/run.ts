import Console from "../console.ts";
import type { Program } from "./front/ast.ts";
import { Lexer } from "./front/lexer.ts";
import Parser from "./front/parser.ts";
import Interpreter from "./back/interpret.ts";
import Environment from "./back/env.ts";
// let env
import { env } from "../module.ts";
export function run(code: string) {
  let lexer = new Lexer(code);
  let tokens = lexer.tokenize();
  console.log(tokens);
  Console.print(JSON.stringify(tokens,null,2));
  if (lexer.err == true) {
    Console.error("Lexer error: " + lexer.errMessage);
    return;
  }
  console.log("--------tokens--------");
  let ast = {
    kind: "Program",
    body: [],
  } as Program;
  let parser = new Parser();
  ast = parser.produceAST(tokens);
  console.dir(ast);
  Console.print(JSON.stringify(ast,null,2))
  if (parser.err == true) {
    Console.error("Parser error: " + parser.errMessage);
    return

  }
  console.log("----------ast---------");

  let evaluate = new Interpreter(new Environment(env));
  evaluate.evaluate(ast);
  if (evaluate.err == true) {
    Console.error("Runtime error: " + evaluate.errMessage);
    return

  }

  console.log("----------result---------");
}

// run(`
// fn sum() do
//  1+1
// end
// print [sum]
// `);

// import Parser from "./front/parser.ts";
// import Environment from "./back/env.ts";
// import { evaluate } from "./back/interpret.ts";
// import { MK_BOOL, MK_NULL } from "./back/values.ts";
// import { Lexer } from "./front/lexer.ts";
// // import { addConsole } from "../store.ts";
// // import { useDispatch } from "react-redux";
// import { Program } from "./front/ast.ts";

// export function run(code: string, env: Environment) {
//   let ast: Program = {
//     kind: "Program",
//     body: [],
//   };
//   try {
//     let lexer = new Lexer(code);
//     let tokens = lexer.tokenize();
//     console.dir(tokens);
//     console.log("--------tokens--------");

//     if (lexer.err == true) {
//       return;
//     }

//     let parser = new Parser();
//     ast = parser.produceAST(tokens);
//     console.dir(ast);

//     console.log("----------ast---------");

//     if (parser.err == true) {
//       return;
//     }

//     // Create Default Global Enviornment
//     // env.declareVar("x", MK_NUMBER(100));
//     env.declareVar("true", MK_BOOL(true));
//     env.declareVar("false", MK_BOOL(false));
//     env.declareVar("null", MK_NULL());

//     // INITIALIZE REPL
//     // console.log("\nRepl v0.1");

//     // Continue Repl Until User Stops Or Types `exit`
//     // while (true) {
//     //     const input = prompt("> ");
//     //     // Check for no user input or exit keyword.
//     //     if (!input || input.includes("exit")) {
//     //         Deno.exit(1);
//     //     }

//     //     // Produce AST From sourc-code
//     //     const program = parser.produceAST(input);
//   } catch (err) {
//     alert(err);
//     // let dispatch = useDispatch();
//     // dispatch(addConsole(err));
//   }
//   const result = evaluate(ast, env);
//   console.log(result);
//   console.log("----------result---------");

//   // }
// }
