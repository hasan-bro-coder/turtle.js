import { FuncVal, RuntimeVal, StringVal } from "./values.ts";

export default class Environment {
  public parent?: Environment;
  public variables: Map<string, RuntimeVal>;
  public funcs: Map<string, FuncVal> = new Map();


  constructor(parentENV?: Environment) {
    this.parent = parentENV;
    this.variables = new Map();
    this.funcs = this.getFuncs();

    this.builtins();
  }

  public builtins(){
    this
    .addBuilitinFunc("join", 2, (args: RuntimeVal[]) => {
      // @ts-ignore
      return {value: args[0].value + args[1].value, type: "string"} as StringVal;
    })
  }

  public addBuilitinFunc(
    name: string,
    args: number,
    run: (args: RuntimeVal[]) => RuntimeVal
  ){
    this.setFunc({
      type: "function",
      name,
      args: new Array(args).fill("arg"),
      body: [],
      builtin: true,
      run,
      value: null
    } as FuncVal);
    return this;
  }


  public getFuncs(): Map<string, FuncVal> {
    if (this.parent == undefined) {
      return this.funcs;
    }
    return this.parent.getFuncs();
  }
  public getFunc(name: string): FuncVal {
    if (this.parent == undefined) {
      if (!this.funcs.has(name)) {
        console.error(`Cannot resolve '${name}' as it does not exist.`)
      }
      return this.funcs.get(name) as FuncVal;
    }
    return this.parent.getFunc(name);
  }
  public setFunc(funcVal: FuncVal) {
    if (this.parent == undefined) {
      this.funcs.set(funcVal.name, funcVal);
    } else {
      this.parent.setFunc(funcVal);
    }
  }

  public declareVar(varname: string, value: RuntimeVal): RuntimeVal {
    if (this.variables.has(varname)) {
      console.error(`Cannot declare variable ${varname}. As it already is defined.`);
    }

    this.variables.set(varname, value);
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }

    if (this.parent == undefined) {
      console.error(`Cannot resolve '${varname}' as it does not exist.`);
      return this;
    }

    return this.parent.resolve(varname);
  }
}