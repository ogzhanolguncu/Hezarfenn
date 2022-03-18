import { RuntimeError } from "./RuntimeException";
import { Token, TokenLiteral } from "./Token";

export class Environment {
    private static values: Map<string, TokenLiteral>;

    public get(name: Token): any {
        if (Environment.values.has(name.lexeme)) {
            return Environment.values.get(name.lexeme)
        }

        throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`)
    }

    public define(name: string, value: TokenLiteral): void {
        Environment.values.set(name, value)
    }
}