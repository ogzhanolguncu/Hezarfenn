/* eslint-disable @typescript-eslint/ban-types */
import { Environment } from "./Environment";
import { Interpreter } from "./Interpreter";
import { Func } from "./Stmt";
import { TokenLiteral } from "./Token";

export class HezarfenFunction {
  private declaration: Func;

  constructor(declaration: Func) {
    this.declaration = declaration;
  }

  public call(interpreter: Interpreter, args: TokenLiteral[]): TokenLiteral {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public toString(): string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
