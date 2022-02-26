import util from "util";
import { readFile } from "fs";
import readline from "readline";
import chalk from "chalk";
import { stdin as input, stdout as output } from "process";

import { Lexer } from "./Lexer";
import { Token } from "./Token";

const asyncReadFile = util.promisify(readFile);

let hadError = false;

const main = () => {
  const args = process.argv.slice(2);

  if (args.length > 1) {
    console.log("Usage: hezarfen [script]");
    process.exit(64);
  }
  if (args.length === 1) runFile(args[0]);
  else runPrompt();
};

const runFile = async (path: string) => {
  try {
    const scriptFile = await asyncReadFile(path, "utf-8");
    run(scriptFile);

    if (hadError) process.exit(65);
  } catch (error) {
    console.log(chalk.bgRed("Something went wrong while reading the script file.", error));
    process.exit(65);
  }
};

const runPrompt = () => {
  const REPL = readline.createInterface({ input, output });

  REPL.question("> ", (line) => {
    if (line == null) REPL.close();
    run(line);
    hadError = false;
    REPL.close(); // Close REPL to avoid input being used again.
    runPrompt();
  });
};

const run = (source: string) => {
  const lexer = new Lexer(source);
  const tokens: Token[] = lexer.scanTokens();
  for (const token of tokens) {
    console.log(chalk.greenBright(token));
  }
};

export const error = (number: number, message: string) => report(number, "", message);

const report = (line: number, where: string, message: string) => {
  console.log(chalk.bgYellow(`[line ${line}] Error ${where} : ${message}`));
  hadError = true;
};

main();
