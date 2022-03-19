import { RuntimeError } from "./RuntimeException";
import { Token, TokenLiteral } from "./Token";

export class Environment {
  private values: Map<string, TokenLiteral> = new Map();
  public enclosing?: Environment;

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing;
  }

  public get(name: Token): TokenLiteral {
    const value = this.values.has(name.lexeme) ? this.values.get(name.lexeme) : undefined;

    if (value !== undefined) return value;
    else if (this.enclosing) return this.enclosing.get(name);
    else throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  public define(name: string, value: TokenLiteral): void {
    this.values.set(name, value);
  }

  public assign(name: Token, value: TokenLiteral): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }
    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }
    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }
}
