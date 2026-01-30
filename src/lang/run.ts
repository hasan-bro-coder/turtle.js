import Console from "../console.ts";
import type { Program } from "./front/ast.ts";
import { Lexer } from "./front/lexer.ts";
import Parser from "./front/parser.ts";
import Interpreter from "./back/interpret.ts";
import Environment from "./back/env.ts";
// let env
import { env } from "../module.ts";


let evaluate = new Interpreter(new Environment(env));
export function run(code: string) {
  console.clear();
  let lexer = new Lexer(code);
  let tokens = lexer.tokenize();
  console.table(tokens);
  // Console.print(JSON.stringify(tokens,null,2));
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
  // Console.print(JSON.stringify(ast,null,2))
  if (parser.err == true) {
    Console.error("Parser error: " + parser.errMessage);
    return

  }
  console.log("----------ast---------");
  if (evaluate.getIsRunning()){
    evaluate.interrupt();
    evaluate = new Interpreter(new Environment(env));
  }
  evaluate.globalEnv = new Environment(env);
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
// sum
// `);