import { Binary, Grouping, Literal, Ternary, Unary, Variable } from "./Expr";
import { Expression, Print, Var } from "./Stmt";

export type CombinedStatements = Expression | Print | Var | Binary | Grouping | Literal | Ternary | Unary | Variable

export interface Visitor<T> {
  visitBinaryExpr: (expr: Binary) => T;
  visitGroupingExpr: (expr: Grouping) => T;
  visitLiteralExpr: (expr: Literal) => T;
  visitTernaryExpr: (expr: Ternary) => T;
  visitUnaryExpr: (expr: Unary) => T;
  visitExpressionStmt: (stmt: Expression) => T;
  visitPrintStmt: (stmt: Print) => T;
}

const isAlpha = (char: string): boolean => {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char == "_";
};

const isAlphaNumeric = (char: string): boolean => {
  return isAlpha(char) || isDigit(char);
};

const isDigit = (char: string): boolean => {
  return char >= "0" && char <= "9";
};

export { isAlpha, isAlphaNumeric, isDigit };
