import { TokenType } from "./TokenType";

export class Token {
  type: TokenType;
  lexeme: string;
  literal: string | undefined | null;
  line: number;

  constructor(type: TokenType, lexeme: string, literal: string | undefined | null, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `${TokenType[this.type]} ${this.lexeme} ${this.literal}`;
  }
}
