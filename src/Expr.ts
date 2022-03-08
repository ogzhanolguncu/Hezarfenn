import { Token, TokenLiteral } from './Token'

export interface Visitor<T> {
  visitBinaryExpr: (expr: Binary) => T;
  visitGroupingExpr: (expr: Grouping) => T;
  visitLiteralExpr: (expr: Literal) => T;
  visitTernaryExpr: (expr: Ternary) => T;
  visitUnaryExpr: (expr: Unary) => T;
}
export type Expr = Binary | Grouping | Literal | Ternary | Unary;
export class Binary {
  public left: Expr
  public operator: Token
  public right: Expr

  public constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left
    this.operator = operator
    this.right = right
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpr(this)
  }
}
export class Grouping {
  public expression: Expr

  public constructor(expression: Expr) {
    this.expression = expression
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpr(this)
  }
}
export class Literal {
  public value: TokenLiteral

  public constructor(value: TokenLiteral) {
    this.value = value
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpr(this)
  }
}
export class Ternary {
  public operator: Token
  public left: Expr
  public middle: Expr
  public right: Expr

  public constructor(operator: Token, left: Expr, middle: Expr, right: Expr) {
    this.operator = operator
    this.left = left
    this.middle = middle
    this.right = right
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitTernaryExpr(this)
  }
}
export class Unary {
  public operator: Token
  public right: Expr

  public constructor(operator: Token, right: Expr) {
    this.operator = operator
    this.right = right
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpr(this)
  }
}
