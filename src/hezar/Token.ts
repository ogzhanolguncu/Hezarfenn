import { TokenType } from "./TokenType";

export type TokenLiteral = string | number | boolean | null;

export class Token {
  type: TokenType;
  lexeme: string;
  literal: TokenLiteral
  line: number;

  constructor(type: TokenType, lexeme: string, literal: TokenLiteral | null, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `${TokenType[this.type]} ${this.lexeme} ${this.literal}`;
  }
}
