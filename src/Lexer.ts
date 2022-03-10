import { Hezarfen } from "./Hezarfen";
import { Token, TokenLiteral } from "./Token";
import { TokenType } from "./TokenType";

import * as Utils from "./Utils";

export class Lexer {
  private static keywords: Map<string, TokenType>;
  private source: string;
  private tokens: Token[];
  private start = 0;
  private current = 0;
  private line = 1;

  static {
    Lexer.keywords = new Map<string, TokenType>();
    Lexer.keywords.set("and", TokenType.AND);
    Lexer.keywords.set("class", TokenType.CLASS);
    Lexer.keywords.set("else", TokenType.ELSE);
    Lexer.keywords.set("false", TokenType.FALSE);
    Lexer.keywords.set("for", TokenType.FOR);
    Lexer.keywords.set("fun", TokenType.FUN);
    Lexer.keywords.set("if", TokenType.IF);
    Lexer.keywords.set("nil", TokenType.NIL);
    Lexer.keywords.set("or", TokenType.OR);
    Lexer.keywords.set("print", TokenType.PRINT);
    Lexer.keywords.set("return", TokenType.RETURN);
    Lexer.keywords.set("super", TokenType.SUPER);
    Lexer.keywords.set("this", TokenType.THIS);
    Lexer.keywords.set("true", TokenType.TRUE);
    Lexer.keywords.set("var", TokenType.VAR);
    Lexer.keywords.set("while", TokenType.WHILE);
  }

  constructor(source: string) {
    this.source = source;
    this.tokens = [];
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private scanToken(): void {
    const char = this.advance();
    switch (char) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case '?':
        this.addToken(TokenType.QUESTION);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          // A comment goes until the end of the line.
          while (this.peek() !== '\n' && !this.isAtEnd())
            this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;

      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;
      case '\n':
        this.line++;
        break;

      case '"':
        this.string();
        break;

      default:
        if (Utils.isDigit(char)) {
          this.number();
        } else if (Utils.isAlpha(char)) {
          this.identifier();
        }
        else {
          Hezarfen.error(this.line, "Unexpected character.");
        }
        break;
    }
  }

  private identifier(): void {
    while (Utils.isAlphaNumeric(this.peek()))
      this.advance();

    // See if the identifier is a reserved word.
    const text = this.source.substring(this.start, this.current);

    let type = Lexer.keywords.get(text);
    if (type === undefined)
      type = TokenType.IDENTIFIER;
    this.addToken(type);
  }


  private number(): void {
    while (Utils.isDigit(this.peek())) this.advance();

    // CHECK IF NUMBER DECIMAL
    if (this.peek() === "." && Utils.isDigit(this.peekNext())) {
      this.advance();
      while (Utils.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER, parseFloat(this.source.substring(this.start, this.current)));
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n')
        this.line++;
      this.advance();
    }

    // Unterminated string.
    if (this.isAtEnd()) {
      Hezarfen.error(this.line, "Unterminated string.");
      return;
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }
  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;
    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }

  private advance(): string {
    this.current++;
    return this.source.charAt(this.current - 1);
  }

  private addToken(type: TokenType, literal?: TokenLiteral): void {
    literal = literal === undefined ? null : literal;

    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }
}
