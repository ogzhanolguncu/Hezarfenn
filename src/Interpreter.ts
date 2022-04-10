/* eslint-disable @typescript-eslint/ban-types */
import chalk from "chalk";
import { Environment } from "./Environment";
import {
  Grouping,
  Literal,
  Expr,
  Unary,
  Binary,
  Ternary,
  Variable,
  Assign,
  Visitor as ExprVisitor,
  Logical,
  Call,
} from "./Expr";
import { Hezarfen } from "./Hezarfen";
import { HezarfenCallable } from "./HezarfenCallable";
import { HezarfenFunction } from "./HezarfenFunction";
import { ReturnException } from "./ReturnException";
import { RuntimeError } from "./RuntimeException";
import { Block, Expression, Func, If, Print, Return, Stmt, Var, Visitor as StmtVisitor, While } from "./Stmt";
import { Token, TokenLiteral } from "./Token";
import { TokenType } from "./TokenType";

function isHezarfenCallable(callee: any): callee is HezarfenCallable {
  return (
    callee.call &&
    typeof callee.call === "function" &&
    callee.arity &&
    typeof callee.arity === "function" &&
    callee.toString &&
    typeof callee.toString === "function"
  );
}

export class Interpreter implements ExprVisitor<TokenLiteral>, StmtVisitor<void> {
  public globals: Environment;
  private environment: Environment;

  public constructor() {
    this.globals = new Environment();
    this.environment = this.globals;

    this.globals.define("clock", {
      arity(): number {
        return 0;
      },

      call(): TokenLiteral {
        return Date.now();
      },

      toString() {
        return "<native fn>";
      },
    });
  }

  interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error: any) {
      Hezarfen.runtimeError(error);
    }
  }

  private stringify(object: TokenLiteral): string {
    if (object === null) return "nil";

    if (typeof object === "number") {
      let text = object.toString();
      if (text.endsWith(".0")) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }
    return object.toString();
  }

  public visitLiteralExpr(expr: Literal): TokenLiteral {
    return expr.value;
  }

  public visitLogicalExpr(expr: Logical) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    }
    if (expr.operator.type === TokenType.AND) {
      if (this.isTruthy(left)) return left;
      return false;
    }
    return this.evaluate(expr.right);
  }

  public visitGroupingExpr(expr: Grouping): TokenLiteral {
    return this.evaluate(expr.expression);
  }

  public visitWhileStmt(stmt: While) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
    return null;
  }

  public visitTernaryExpr(expr: Ternary): TokenLiteral {
    const left = this.evaluate(expr.left);
    const middle = this.evaluate(expr.middle);
    const right = this.evaluate(expr.right);

    if (left) {
      return middle;
    } else {
      return right;
    }
  }

  public visitUnaryExpr(expr: Unary): TokenLiteral {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -Number(right);
    }
    return null;
  }

  public visitVariableExpr(expr: Variable): TokenLiteral {
    return this.environment.get(expr.name);
  }

  public visitBinaryExpr(expr: Binary): TokenLiteral {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.PLUS:
        if (
          (typeof left === "string" && typeof right === "number") ||
          (typeof left === "number" && typeof right === "string")
        ) {
          return this.stringify(left) + this.stringify(right);
        }
        if (typeof left === "number" && typeof right === "number") {
          return Number(left) + Number(right);
        }
        if (typeof left === "string" && typeof right === "string") {
          return String(left) + String(right);
        }
        throw new RuntimeError(expr.operator, "Operands must be two numbers or two string.");
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case TokenType.COMMA: // TODO: Check here for future implementations.
        return right;
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }
    return null;
  }

  public visitCallExpr(expr: Call) {
    const callee = this.evaluate(expr.callee);

    const args = [];
    for (const arg of expr._arguments) {
      args.push(this.evaluate(arg));
    }

    if (!isHezarfenCallable(callee)) {
      throw new RuntimeError(expr.paren, "Can only call functions and classes.");
    }

    const fn = callee;
    if (args.length != fn.arity()) {
      throw new RuntimeError(expr.paren, `Expected ${fn.arity()} arguments but got ${args.length}.`);
    }

    return fn.call(this, args);
  }

  private isEqual(a: TokenLiteral, b: TokenLiteral): boolean {
    if (a === null && b === null) return true;
    if (a === null) return false;

    return Object.is(a, b);
  }

  private isTruthy(object: TokenLiteral) {
    if (object === null) return false;
    if (typeof object === "boolean") return Boolean(object);
    return true;
  }

  private checkNumberOperand(operator: Token, operand: string | number | boolean | Object | null) {
    if (operand instanceof Number) return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: string | number | boolean | Object | null,
    right: string | number | boolean | Object | null
  ) {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private evaluate(expr: Expr): TokenLiteral {
    return expr.accept(this);
  }

  private execute(stmt: Stmt) {
    stmt.accept(this);
  }

  public executeBlock(statements: Stmt[], environment: Environment) {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  public visitBlockStmt(stmt: Block) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return null;
  }

  public visitExpressionStmt(stmt: Expression) {
    this.evaluate(stmt.expression);
    return null;
  }
  public visitFuncStmt(stmt: Func) {
    const func = new HezarfenFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, func);
    return null;
  }

  public visitIfStmt(stmt: If) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
    return null;
  }

  public visitPrintStmt(stmt: Print) {
    const value = this.evaluate(stmt.expression);
    console.log(chalk.green(this.stringify(value !== null ? value.toString() : "nil")));
  }

  public visitReturnStmt(stmt: Return) {
    let value: TokenLiteral = null;
    if (stmt.value != null) {
      value = this.evaluate(stmt.value);
    }
    throw new ReturnException(value);
  }

  public visitVarStmt(stmt: Var) {
    if (stmt.initializer !== null) {
      const value = this.evaluate(stmt.initializer);
      this.environment.define(stmt.name.lexeme, value);
    }
    return null;
  }

  public visitAssignExpr(expr: Assign) {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }
}
