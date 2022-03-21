import { Expr } from "./Expr";
import { Token } from "./Token";

export interface Visitor<T> {
    visitBlockStmt: (Stmt: Block) => T;
    visitExpressionStmt: (Stmt: Expression) => T;
    visitIfStmt: (Stmt: If) => T;
    visitPrintStmt: (Stmt: Print) => T;
    visitVarStmt: (Stmt: Var) => T;
}

export type Stmt = Block | Expression | If | Print | Var;

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

export class If {
    public conditition: Expr;
    public thenBranch: Stmt;
    public elseBranch: Stmt | null;

    public constructor(conditition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
        this.conditition = conditition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIfStmt(this);
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

