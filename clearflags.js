import { extractPack, compilePack } from "@foundryvtt/foundryvtt-cli";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname, __filename);

const packs = [
  "classes",
  "classes-e-subclasses-features",
  "magias",
  "racas",
  "subclasses",
];

const clearFlags = (filePath) => {
  const data = JSON.parse(readFileSync(filePath, "utf8"));

  if (data.flags.plutonium) {
    console.log("Flag plutonium found in", filePath);
    delete data.flags.plutonium;
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const clearFlagsInFolder = (folderPath) => {
  const files = readdirSync(folderPath);
  files.forEach((file) => {
    clearFlags(join(folderPath, file));
  });
};

const execute = async () => {
  for (const pack of packs) {
    console.log("Clearing flags in", pack);
    const packPath = join(__dirname, "packs", pack);
    const destPath = join(__dirname, "packs", pack, "_source");
    await extractPack(packPath, destPath);
    clearFlagsInFolder(destPath);
    await compilePack(destPath, packPath);
  }
};

execute();
