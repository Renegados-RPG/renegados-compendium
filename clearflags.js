import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PACKS } from "./constants.js";
import * as prettier from "prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clearFlags = async (filePath) => {
  const data = JSON.parse(readFileSync(filePath, "utf8"));

  if (data.flags.plutonium) {
    console.log("Flag plutonium found in", filePath);
    delete data.flags.plutonium;
  }

  try {
    writeFileSync(
      filePath,
      await prettier.format(JSON.stringify(data), {
        parser: "json-stringify",
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        trailingComma: "all",
        arrowParens: "always",
        endOfLine: "crlf",
      }),
    );
  } catch (err) {
    console.error("Error writing file", filePath, err);
  }
};

const clearFlagsInFolder = (folderPath) => {
  const files = readdirSync(folderPath);
  files.forEach((file) => {
    clearFlags(join(folderPath, file));
  });
};

const execute = async () => {
  for (const pack of PACKS) {
    console.log("Clearing flags in", pack);
    const packPath = join(__dirname, "packs", pack);
    const sourcesPath = join(__dirname, "packs_source", pack);
    await extractPack(packPath, sourcesPath);
    clearFlagsInFolder(sourcesPath);
    console.log("Cleared flags in", pack);
  }
};

execute();
