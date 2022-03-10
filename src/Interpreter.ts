/* eslint-disable @typescript-eslint/ban-types */
import { Grouping, Literal, Visitor, Expr, Unary, Binary, Ternary } from "./Expr";
import { Hezarfen } from "./Hezarfen";
import { RuntimeError } from "./RuntimeException";
import { Token, TokenLiteral } from "./Token";
import { TokenType } from "./TokenType";

type InterpreterVisitorType = TokenLiteral | Object

export class Interpreter implements Visitor<InterpreterVisitorType> {

    interpreter(expression: Expr): void {
        try {
            const value = this.evaluate(expression)
            console.log(this.stringify(value));
        } catch (error: any) {
            Hezarfen.runtimeError(error);
        }
    }

    private stringify(object: InterpreterVisitorType): string {
        if (object === null) return "nil";

        if (object instanceof Number) {
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
        if (object instanceof Boolean) return Boolean(object);
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
}

