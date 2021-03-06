import util from "util";
import { readFile } from "fs";
import readline from "readline";
import chalk from "chalk";

import { Lexer } from "./Lexer";
import { Token } from "./Token";
import { Parser } from "./Parser";
import { TokenType } from "./TokenType";
import { RuntimeError } from "./RuntimeException";
import { Interpreter } from "./Interpreter";
import { Stmt } from "./Stmt";

const asyncReadFile = util.promisify(readFile);

export class Hezarfen {
  private static interpreter = new Interpreter();
  public static hadError = false;
  public static hadRuntimeError = false;

  public static async runFile(path: string) {
    try {
      const scriptFile = await asyncReadFile(path, "utf-8");
      Hezarfen.run(scriptFile);

      if (this.hadError) process.exit(65);
      if (this.hadRuntimeError) process.exit(70);
    } catch (error) {
      console.log(chalk.red("Something went wrong while reading the script file.", error));
      process.exit(65);
    }
  }

  public static runPrompt(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "-> ",
    });

    rl.write("Hezarfen REPL. Press Ctrl + C to exit.\n");
    rl.prompt();

    rl.on("line", async (line) => {
      const source = line.trim();
      this.run(source);

      this.hadError = false;
      rl.prompt();
    });
  }

  private static run(source: string): void {
    const lexer = new Lexer(source);
    const tokens: Token[] = lexer.scanTokens();
    const parser = new Parser([...tokens]);
    const statements: Stmt[] | null = parser.parse();

    if (this.hadError) return;

    if (statements === null) {
      console.log(chalk.redBright("Internal Error"));
    } else {
      Hezarfen.interpreter.interpret(statements);
    }
  }

  public static error(token: Token | number, message: string): void {
    if (typeof token === "number") {
      this.report(token, "", message);
    } else {
      if (token.type === TokenType.EOF) {
        this.report(token.line, " at end", message);
      } else {
        this.report(token.line, ` at '${token.lexeme}'`, message);
      }
    }
  }

  static runtimeError(error: RuntimeError) {
    console.error(chalk.redBright(`${error.message} \n [line ${error.token.line}]`));
    this.hadError = true;
  }

  public static report(line: number, where: string, message: string): void {
    const msg = `[line ${line}] Error${where}: ${message}`;
    console.error(chalk.redBright(msg));

    this.hadError = true;
  }
}

(function main() {
  const args = process.argv.slice(2);

  if (args.length > 1) {
    console.log("Usage: ./hezarfen [script]");
    process.exit(64);
  } else if (args.length == 1) {
    Hezarfen.runFile(args[0]);
  } else {
    Hezarfen.runPrompt();
  }
})();
