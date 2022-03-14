import { Token } from './Token'

export interface Visitor<T> {
    visitExpressionStmt: (stmt:Expression) => T;
    visitPrintStmt: (stmt:Print) => T;
  }
export type Expr = Expression | Print; 
export class Expression { 
public left:  Expr  
public  operator:  Token 
public  right:  Expr 

public constructor(left: Expr , operator: Token, right: Expr) {this.left = left
this. operator =  operator
this. right =  right
}

public accept<T>(visitor: Visitor<T>): T {
return visitor.visitExpressionStmt(this)
  }
}
export class Print { 
public expression:  Expr 

public constructor(expression: Expr) {this.expression = expression
}

public accept<T>(visitor: Visitor<T>): T {
return visitor.visitPrintStmt(this)
  }
}
