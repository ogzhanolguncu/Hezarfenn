import chalk from "chalk";
import { Assign, Binary, Call, Expr, Grouping, Literal, Logical, Ternary, Unary, Variable } from "./Expr";
import { Hezarfen } from "./Hezarfen";
import { Block, Expression, If, Print, Stmt, Var, While } from "./Stmt";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
/* 
GRAMMAR
program       -> declaration * EOF
declaration   -> varDecl | statement;
statement     -> exprStmt | ifStmt | printStmt | block | whileStmt | forStmt
whileStmt     -> "while" "(" expression ")" statement;
forStmt       -> "for" "(" ( varDecl | exprStmt | ";" ) expression? ";" expression? ")" statement ;
ifStmt        -> "if" "(" expression ")" statement
                  ( "else" statement )?; 
block         -> "{" declaration* "}"
varDecl       -> "var" IDENTIFIER ( "=" expression )? ";"
exprStmt      -> expression ";"
printStmt     -> "print" expression
expression    -> assignment;
assigment     -> IDENTIFIER "=" assignment | logic_or | series;
logic_or      -> logic_and ( "or" logic_and )*;
logic_and     -> equality ("and" equality)*;
series        -> conditional (( "," ) conditional)
conditional   -> equality (( "?") expression) expression
equality      -> comparison ( ( "!=" | "==" ) comparison )* 
comparison    -> term ( ( ">" | ">=" | "<" | "<=" ) term )* 
term          -> factor ( ( "-" | "+" ) factor )* 
factor        -> unary ( ( "/" | "*" ) unary )* 
unary         -> ( "!" | "-" ) unary | call
call          -> primary ( "(" arguments? ")" )*;
arguments     -> expression ( "," expression)*;
primary       -> NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" | IDENTIFIER 
*/

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse() {
    const statements: Stmt[] = [];
    try {
      // if (!(this.peek().type === TokenType.VAR || this.peek().type === TokenType.PRINT)) {
      //   statements.push(this.printStatement());
      //   return statements;
      // }
      while (!this.isAtEnd()) {
        statements.push(this.decleration());
      }
      return statements;
    } catch (error: any) {
      console.log(chalk.red("Internal error."));
      return error;
    }
  }

  private decleration(): Stmt {
    try {
      if (this.match(TokenType.VAR)) return this.varDeclaration();
      return this.statement();
    } catch (error) {
      this.synchronize();
      return new Expression(new Literal(null));
    }
  }

  private varDeclaration(): Stmt {
    const name: Token = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

    let initializer: Expr = new Literal(null);
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration");
    return new Var(name, initializer);
  }

  private statement(): Stmt {
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.FOR)) return this.forStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());
    return this.expressionStatement();
  }

  private forStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");
    let initializer;
    if (this.match(TokenType.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TokenType.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition");

    let increment = null;
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

    let body: Stmt = this.statement();

    if (increment !== null) {
      body = new Block([body, new Expression(increment)]);
    }

    if (condition === null) condition = new Literal(true);
    body = new While(condition, body);

    if (initializer !== null) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  private whileStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition: Expr = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
    const body = this.statement();

    return new While(condition, body);
  }

  private printStatement(): Stmt {
    const value: Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Print(value);
  }

  private ifStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition: Expr = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

    const thenBranch: Stmt = this.statement();
    let elseBranch = null;
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }

    return new If(condition, thenBranch, elseBranch);
  }

  private expressionStatement(): Stmt {
    const expr: Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression");
    return new Expression(expr);
  }

  private block(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.decleration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private assignment(): Expr {
    const expr = this.or();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const name = expr.name;
        return new Assign(name, value);
      }
      this.error(equals, "Invalid assignment target.");
    }
    return expr;
  }

  private or(): Expr {
    let expr: Expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator: Token = this.previous();
      const right: Expr = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private and(): Expr {
    let expr = this.series();

    while (this.match(TokenType.AND)) {
      const operator: Token = this.previous();
      const right: Expr = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }
  private expression(): Expr {
    return this.assignment();
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

    return this.call();
  }

  private finishCall(callee: Expr) {
    const argumentsList = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (argumentsList.length >= 255) this.error(this.peek(), "Can't have more than 255 arguments.");
        argumentsList.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

    return new Call(callee, paren, argumentsList);
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
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
