import { Interpreter } from "./Interpreter";
import { TokenLiteral } from "./Token";

export interface HezarfenCallable {
  arity(): number;
  call(interpreter: Interpreter, argumentList: TokenLiteral[]): TokenLiteral;
}
