import { Binary, Expr, Grouping, Literal, Ternary, Unary } from "./Expr";
import { Hezarfen } from "./Hezarfen";
import { Token } from "./Token";
import { TokenType } from "./TokenType";


/* 
CURRENT GRAMMAR
expression → series ;
series -> conditional (( "," ) conditional)
conditional -> equality (( "?") expression) expression
equality → comparison ( ( "!=" | "==" ) comparison )* ;
comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term → factor ( ( "-" | "+" ) factor )* ;
factor → unary ( ( "/" | "*" ) unary )* ;
unary → ( "!" | "-" ) unary | primary ;
primary → NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" ;
*/

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse() {
    try {
      return this.expression();
    } catch (error) {
      return null;
    }
  }

  private expression(): Expr {
    return this.series();
  }

  private series(): Expr {
    let expr: Expr = this.conditional();

    while (this.match(TokenType.COMMA)) {
      const operator: Token = this.previous();
      const right: Expr = this.conditional();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private conditional(): Expr {
    let expr: Expr = this.equality();

    if (this.match(TokenType.QUESTION)) {
      const question: Token = this.previous();
      const middle: Expr = this.expression();
      this.consume(TokenType.COLON, "Expect ':' after expression.");
      const right: Expr = this.expression();
      expr = new Ternary(question, expr, middle, right);
    }

    return expr;
  }

  private equality(): Expr {
    let expr: Expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }


  private comparison(): Expr {
    let expr: Expr = this.term();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr = this.term();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  private term(): Expr {
    let expr: Expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr: Expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE))
      return new Literal(false);
    if (this.match(TokenType.TRUE))
      return new Literal(true);
    if (this.match(TokenType.NIL))
      return new Literal(null);
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);

    }
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr: Expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }
    throw this.error(this.peek(), "Expect expression");
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private previous(): Token {
    return this.tokens.at(this.current - 1) || new Token(TokenType.EOF, "", "", 0);
  }

  private isAtEnd() {
    return this.peek()?.type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private error(token: Token, message: string) {
    Hezarfen.error(token, message);
    return new Error();
  }


  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      // END OF LINE
      if (this.previous().type === TokenType.SEMICOLON) return;
    }

    switch (this.peek().type) {
      case TokenType.CLASS:
      case TokenType.FUN:
      case TokenType.VAR:
      case TokenType.FOR:
      case TokenType.IF:
      case TokenType.WHILE:
      case TokenType.PRINT:
      case TokenType.RETURN:
        return;
    }
    this.advance();
  }
}