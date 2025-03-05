#!/usr/bin/env node

import { spawn } from "child_process";

import { program } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import * as clearFlags from "./commands/clearFlags.js";
import * as compile from "./commands/compilePackSource.js";
import * as extract from "./commands/extractPackSource.js";
import * as parseSpells from "./commands/parseSpells.js";
import * as parseSpellsList from "./commands/parseSpellsList.js";

program.version("1.0.0").description("Renegados CLI");

program.action(() => {
  inquirer
    .prompt([
      {
        type: "select",
        name: "command",
        message: "What's do you want to do?",
        choices: [
          { name: "Extract packs", value: "extract" },
          { name: "Compile packs", value: "compile" },
          { name: "Clear flags", value: "clear-flags" },
          { name: "Parse spells list", value: "parse-spells-list" },
          { name: "Parse spells", value: "parse-spells" },
          // { name: "View compendium", value: "view-compendium" },
        ],
      },
    ])
    .then(async ({ command }) => {
      const spinner = ora().start();
      switch (command) {
        case "extract":
          spinner.text = "Extracting packs source";
          await extract.execute();
          spinner.succeed("Packs source extracted");
          break;
        case "compile":
          spinner.text = "Compiling packs source";
          await compile.execute();
          spinner.succeed("Packs source compiled");
          break;
        case "clear-flags":
          spinner.text = "Clearing flags";
          await clearFlags.execute();
          spinner.succeed("Flags cleared");
          break;
        case "parse-spells-list":
          spinner.text = "Parsing spells list";
          await parseSpellsList.execute();
          spinner.succeed("Spells list parsed");
          break;
        case "parse-spells":
          spinner.text = "Parsing spells";
          await parseSpells.execute();
          spinner.succeed("Spells parsed");
          break;
        default:
          break;
      }

      const prettierSpinner = ora().start();
      await new Promise(function (resolve, reject) {
        const prettier = spawn("yarn", ["prettier", "--write", "--ignore-unknown", ".\\packs_source\\"], {
          shell: true,
        });
        prettier.stdout.on("data", (data) => {
          prettierSpinner.text = data.toString();
        });
        prettier.on("close", function (code) {
          prettierSpinner.succeed("Prettier process completed");
          // *** Process completed
          resolve(code);
        });
        prettier.on("error", function (err) {
          // *** Process creation failed
          reject(err);
        });
      });
    });
});

program.parse(process.argv);
