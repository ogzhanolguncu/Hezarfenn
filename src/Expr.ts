import { Token, TokenLiteral } from "./Token";

export interface Visitor<T> {
    visitAssignExpr: (Expr: Assign) => T;
    visitBinaryExpr: (Expr: Binary) => T;
    visitCallExpr: (Expr: Call) => T;
    visitGroupingExpr: (Expr: Grouping) => T;
    visitLiteralExpr: (Expr: Literal) => T;
    visitLogicalExpr: (Expr: Logical) => T;
    visitUnaryExpr: (Expr: Unary) => T;
    visitTernaryExpr: (Expr: Ternary) => T;
    visitVariableExpr: (Expr: Variable) => T;
}

export type Expr = Assign | Binary | Call | Grouping | Literal | Logical | Unary | Ternary | Variable;

export class Assign {
    public name: Token;
    public value: Expr;

    public constructor(name: Token, value: Expr) {
        this.name = name;
        this.value = value;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitAssignExpr(this);
    }
}

export class Binary {
    public left: Expr;
    public operator: Token;
    public right: Expr;

    public constructor(left: Expr, operator: Token, right: Expr) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBinaryExpr(this);
    }
}

export class Call {
    public callee: Expr;
    public paren: Token;
    public _arguments: Expr[];

    public constructor(callee: Expr, paren: Token, _arguments: Expr[]) {
        this.callee = callee;
        this.paren = paren;
        this._arguments = _arguments;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitCallExpr(this);
    }
}

export class Grouping {
    public expression: Expr;

    public constructor(expression: Expr) {
        this.expression = expression;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitGroupingExpr(this);
    }
}

export class Literal {
    public value: TokenLiteral;

    public constructor(value: TokenLiteral) {
        this.value = value;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLiteralExpr(this);
    }
}

export class Logical {
    public left: Expr;
    public operator: Token;
    public right: Expr;

    public constructor(left: Expr, operator: Token, right: Expr) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLogicalExpr(this);
    }
}

export class Unary {
    public operator: Token;
    public right: Expr;

    public constructor(operator: Token, right: Expr) {
        this.operator = operator;
        this.right = right;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitUnaryExpr(this);
    }
}

export class Ternary {
    public operator: Token;
    public left: Expr;
    public middle: Expr;
    public right: Expr;

    public constructor(operator: Token, left: Expr, middle: Expr, right: Expr) {
        this.operator = operator;
        this.left = left;
        this.middle = middle;
        this.right = right;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitTernaryExpr(this);
    }
}

export class Variable {
    public name: Token;

    public constructor(name: Token) {
        this.name = name;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVariableExpr(this);
    }
}

