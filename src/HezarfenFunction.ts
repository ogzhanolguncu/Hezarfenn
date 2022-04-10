/* eslint-disable @typescript-eslint/ban-types */
import { Environment } from "./Environment";
import { Interpreter } from "./Interpreter";
import { ReturnException } from "./ReturnException";
import { Func } from "./Stmt";
import { TokenLiteral } from "./Token";

export class HezarfenFunction {
  private declaration: Func;
  private closure: Environment;

  constructor(declaration: Func, closure: Environment) {
    this.declaration = declaration;
    this.closure = closure;
  }

  public call(interpreter: Interpreter, args: TokenLiteral[]): TokenLiteral {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (err) {
      if (err instanceof ReturnException) {
        return err.value;
      }
    }
    return null;
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public toString(): string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
