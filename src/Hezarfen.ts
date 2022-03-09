import util from "util";
import { readFile } from "fs";
import readline from "readline";
import chalk from "chalk";

import { Lexer } from "./Lexer";
import { Token } from "./Token";
import { Parser } from "./Parser";
import { AstPrinter } from "./AstPrinter";

const asyncReadFile = util.promisify(readFile);

let hadError = false;
export class Hezarfen {
  public static hadError = false;

  public static async runFile(path: string) {
    try {
      const scriptFile = await asyncReadFile(path, "utf-8");
      Hezarfen.run(scriptFile);

      if (hadError) process.exit(65);
    } catch (error) {
      console.log(chalk.bgRed("Something went wrong while reading the script file.", error));
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
    const parser = new Parser(tokens);
    const expression = parser.parse();

    if (hadError) return;

    if (expression === null) {
      console.log(chalk.redBright("Internal Error"));
    } else {
      console.log(chalk.greenBright(new AstPrinter().print(expression)));
    }
  }

  public static error = (number: number | Token, message: string) => this.report(number, "", message);

  public static report = (line: number | Token, where: string, message: string) => {
    console.log(chalk.yellowBright(`[line ${line}] Error ${where} : ${message}`));
    hadError = true;
  };
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
