import { TokenLiteral } from "./Token";

export class ReturnException {
  public value: TokenLiteral;

  public constructor(value: TokenLiteral) {
    this.value = value;
  }
}
