import { createWriteStream, WriteStream } from "fs";


type ExpressionTypes = "Binary" | "Grouping" | "Literal" | "Ternary" | "Unary"

const main = () => {
    defineAst('../hezar', "Expr", {
        "Binary": "left: Expr , operator: Token, right: Expr",
        "Grouping": "expression: Expr",
        "Literal": "value: TokenLiteral",
        "Ternary": "operator: Token, left: Expr, middle: Expr, right: Expr",
        "Unary": "operator: Token, right: Expr"
    });
};

const defineAst = async (outputDir: string, fileName: string, exprList: { [Key in ExpressionTypes]: string }) => {
    const path = `${outputDir}/${fileName}.ts`

    const writeStream = createWriteStream(path, { flags: 'a' })
    writeStream.write("import { Token, TokenLiteral } from './Token'" + "\r\n");
    writeStream.write("\r\n");

    defineVisitor(writeStream, fileName, exprList);
    writeStream.write(`export type Expr = ${Object.keys(exprList).join(' | ')}; \r\n`);

    // The AST classes.
    for (const [className, field] of Object.entries(exprList)) {
        defineType(writeStream, fileName, className, field);
    }

}


const defineVisitor = (writeStream: WriteStream, fileName: string, exprList: { [Key in ExpressionTypes]: string }) => {
    writeStream.write("export interface Visitor<T> {" + "\r\n");
    for (const [className] of Object.entries(exprList)) {
        writeStream.write("    visit" + className + fileName + ": (" + fileName.toLowerCase() + ":" + className + ") => T;" + "\r\n");
    }
    writeStream.write("  }" + "\r\n");
}

function defineType(writeStream: WriteStream, fileName: string, className: string, fieldList: string) {
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