import { Token } from './Token'
import { CombinedStatements, Visitor } from './Utils'

export type Expr = CombinedStatements
export class Expression {
  public expression: Expr

  public constructor(expression: Expr) {
    this.expression = expression
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStmt(this)
  }
}
export class Print {
  public expression: Expr

  public constructor(expression: Expr) {
    this.expression = expression
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStmt(this)
  }
}
export class Var {
  public name: Token
  public initializer: Expr

  public constructor(name: Token, initializer: Expr) {
    this.name = name
    this.initializer = initializer
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitVarStmt(this)
  }
}
