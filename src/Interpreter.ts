/* eslint-disable @typescript-eslint/ban-types */
import chalk from "chalk";
import { Environment } from "./Environment";
import { Grouping, Literal, Expr, Unary, Binary, Ternary, Variable } from "./Expr";
import { Hezarfen } from "./Hezarfen";
import { RuntimeError } from "./RuntimeException";
import { Expression, Print, Var } from "./Stmt";
import { Token, TokenLiteral } from "./Token";
import { TokenType } from "./TokenType";
import { CombinedStatements, Visitor } from "./Utils";

type InterpreterVisitorType = TokenLiteral

export class Interpreter implements Visitor<InterpreterVisitorType> {
    private environment: Environment = new Environment();
    interpreter(statements: CombinedStatements[]): void {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        } catch (error: any) {
            Hezarfen.runtimeError(error);
        }
    }

    private stringify(object: InterpreterVisitorType): string {
        if (object === null) return "nil";

        if (typeof object === "number") {
            let text = object.toString();
            if (text.endsWith(".0")) {
                text = text.substring(0, text.length - 2)
            }
            return text;
        }
        return object.toString();
    }

    public visitLiteralExpr(expr: Literal): InterpreterVisitorType {
        return expr.value
    };

    public visitGroupingExpr(expr: Grouping): InterpreterVisitorType {
        return this.evaluate(expr.expression)
    }

    // 5 ? 6 : 7
    public visitTernaryExpr(expr: Ternary): InterpreterVisitorType {
        const left = this.evaluate(expr.left);
        const middle = this.evaluate(expr.middle);
        const right = this.evaluate(expr.right);

        if (left) {
            return middle
        } else {
            return right;
        }
    }

    public visitUnaryExpr(expr: Unary): InterpreterVisitorType {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                return -Number(right);
        }
        return null
    }

    public visitVariableExpr(expr: Variable): InterpreterVisitorType {
        return this.environment.get(expr.name);
    }


    public visitBinaryExpr(expr: Binary): InterpreterVisitorType {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -Number(right);
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) - Number(right);
            case TokenType.PLUS:
                if ((typeof left === "string" && typeof right === "number")
                    || (typeof left === "number" && typeof right === "string")) {
                    return this.stringify(left) + this.stringify(right);
                }
                if (typeof left === "number" && typeof right === "number") {
                    return Number(left) + Number(right);
                }
                if (typeof left === "string" && typeof right === "string") {
                    return String(left) + String(right);
                }
                throw new RuntimeError(expr.operator, "Operands must be two numbers or two string.")
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
            case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);
        }
        return null;
    }

    private isEqual(a: InterpreterVisitorType, b: InterpreterVisitorType): boolean {
        if (a === null && b === null) return true;
        if (a === null) return false;

        return Object.is(a, b)
    }

    private isTruthy(object: InterpreterVisitorType) {
        if (object === null) return false;
        if (typeof object === "boolean") return Boolean(object);
        return true;
    }

    private checkNumberOperand(operator: Token, operand: string | number | boolean | Object | null) {
        if (operand instanceof Number) return;
        throw new RuntimeError(operator, "Operand must be a number.");
    }

    private checkNumberOperands(operator: Token,
        left: string | number | boolean | Object | null,
        right: string | number | boolean | Object | null) {
        if (typeof left === "number" && typeof right === "number") return;
        throw new RuntimeError(operator, "Operands must be numbers.");
    }

    private evaluate(expr: Expr): InterpreterVisitorType {
        return expr.accept(this)
    }

    private execute(stmt: CombinedStatements) {
        stmt.accept(this);
    }

    public visitExpressionStmt(stmt: Expression) {
        this.evaluate(stmt.expression);
        return null;
    }

    public visitPrintStmt(stmt: Print) {
        const value = this.evaluate(stmt.expression);
        console.log(chalk.green(this.stringify(value)))
        return null;
    }

    public visitVarStmt(stmt: Var) {
        if (stmt.initializer !== null) {
            const value = this.evaluate(stmt.initializer);
            this.environment.define(stmt.name.lexeme, value);
        }
        return null
    }

}

