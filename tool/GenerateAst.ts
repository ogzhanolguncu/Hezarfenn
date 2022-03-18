import { createWriteStream, WriteStream } from "fs";


type StatementTypes = "Expression" | "Print"
type ExpressionTypes = "Binary" | "Grouping" | "Literal" | "Ternary" | "Unary"

type CombinedTypes = {
    "Binary": ExpressionTypes,
    "Grouping": ExpressionTypes,
    "Literal": ExpressionTypes,
    "Ternary": ExpressionTypes,
    "Unary": ExpressionTypes
    "Expression": StatementTypes
    "Print": StatementTypes
}


const main = () => {
    defineAst('../src', "Expr", {
        "Binary": "left: Expr , operator: Token, right: Expr",
        "Grouping": "expression: Expr",
        "Literal": "value: TokenLiteral",
        "Ternary": "operator: Token, left: Expr, middle: Expr, right: Expr",
        "Unary": "operator: Token, right: Expr",
    });

    defineAst('../src', "Stmt", {
        "Expression": "expression: Expr",
        "Print": "expression: Expr",
    });
};

const defineAst = async (outputDir: string, fileName: "Expr" | "Stmt", exprList: { [Key in keyof Partial<CombinedTypes>]: string }) => {
    const path = `${outputDir}/${fileName}.ts`

    const writeStream = createWriteStream(path, { flags: 'a' })
    writeStream.write(`import { Token ${fileName !== "Stmt" ? ", TokenLiteral" : ""}} from './Token'\r\n`);
    if (fileName === "Stmt") writeStream.write(`import { CombinedStatements } from './Utils'\r\n`);
    writeStream.write("\r\n");

    defineVisitor(writeStream, fileName, exprList);
    if (fileName === "Stmt") {
        writeStream.write(`export type Expr = CombinedStatements \r\n`);
    }
    if (fileName === "Expr") {
        writeStream.write(`export type Expr = ${Object.keys(exprList).join(' | ')}; \r\n`);
    }

    // The AST classes.
    for (const [className, field] of Object.entries(exprList)) {
        defineType(writeStream, fileName, className, field);
    }

}


const defineVisitor = (writeStream: WriteStream, fileName: "Expr" | "Stmt", exprList: { [Key in keyof Partial<CombinedTypes>]: string }) => {
    writeStream.write("export interface Visitor<T> {" + "\r\n");
    for (const [className] of Object.entries(exprList)) {
        writeStream.write("    visit" + className + fileName + ": (" + fileName.toLowerCase() + ":" + className + ") => T;" + "\r\n");
    }
    writeStream.write("  }" + "\r\n");
}

function defineType(writeStream: WriteStream, fileName: "Expr" | "Stmt", className: string, fieldList: string) {
    writeStream.write(`export class ${className} { \r\n`);
    const fields = fieldList.split(',');
    //Variable Decleration
    fields.forEach(field => {
        const variableName = field.split(':')[0]
        const variableType = field.split(':')[1]
        writeStream.write(`public ${variableName}: ${variableType} \r\n`)
    });
    writeStream.write('\r\n')
    // Constructor.
    writeStream.write(`public constructor(${fieldList}) {`)
    fields.forEach(field => {
        const variableName = field.split(':')[0]
        writeStream.write(`this.${variableName} = ${variableName}\r\n`)
    });
    writeStream.write(`}\r\n`)

    // Visitor pattern.
    writeStream.write('\r\n')
    writeStream.write(`public accept<T>(visitor: Visitor<T>): T {\r\n`)
    writeStream.write(`return visitor.visit${className}${fileName}(this)\r\n`)

    writeStream.write("  }" + "\r\n");
    writeStream.write("}" + "\r\n");
}

main()