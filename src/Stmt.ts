import { Expr } from "./Expr";
import { Token } from "./Token";

export interface Visitor<T> {
    visitBlockStmt: (Stmt: Block) => T;
    visitExpressionStmt: (Stmt: Expression) => T;
    visitPrintStmt: (Stmt: Print) => T;
    visitVarStmt: (Stmt: Var) => T;
}

export type Stmt = Block | Expression | Print | Var;

export class Block {
    public statements: Stmt[];

    public constructor(statements: Stmt[]) {
        this.statements = statements;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBlockStmt(this);
    }
}

export class Expression {
    public expression: Expr;

    public constructor(expression: Expr) {
        this.expression = expression;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpressionStmt(this);
    }
}

export class Print {
    public expression: Expr;

    public constructor(expression: Expr) {
        this.expression = expression;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitPrintStmt(this);
    }
}

export class Var {
    public name: Token;
    public initializer: Expr | null;

    public constructor(name: Token, initializer: Expr | null) {
        this.name = name;
        this.initializer = initializer;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVarStmt(this);
    }
}

