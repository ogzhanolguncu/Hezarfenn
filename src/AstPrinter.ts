import { Assign, Binary, Call, Expr, Grouping, Literal, Logical, Ternary, Unary, Variable, Visitor } from "./Expr";

export class AstPrinter implements Visitor<string> {
  public print(expr: Expr): string {
    return expr.accept(this);
  }

  public visitBinaryExpr(expr: Binary) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: Grouping) {
    return this.parenthesize("group", expr.expression);
  }

  public visitLiteralExpr(expr: Literal) {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  public visitVariableExpr(expr: Variable) {
    return expr.name.lexeme;
  }

  public visitUnaryExpr(expr: Unary) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  public visitAssignExpr(expr: Assign) {
    return expr.name.lexeme;
  }

  public visitTernaryExpr(expr: Ternary) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.middle, expr.right);
  }

  public visitCallExpr(expr: Call) {
    return this.parenthesize(expr.paren.lexeme, expr.callee, ...expr._arguments);
  }

  public visitLogicalExpr(expr: Logical) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    let builder = "";

    builder += "(";
    builder += name;

    for (const expr of exprs) {
      builder += " ";
      builder += expr.accept(this);
    }

    builder += ")";

    return builder;
  }
}

// function main() {
//   const expression: Expr = new Binary(
//     new Unary(new Token(TokenType.MINUS, "-", null, 1), new Literal(123)),
//     new Token(TokenType.STAR, "*", null, 1),
//     new Grouping(new Literal(456.789))
//   );
//   console.log(chalk.green(new AstPrinter().print(expression)));
// }
// main();
