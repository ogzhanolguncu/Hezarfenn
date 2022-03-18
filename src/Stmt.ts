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
