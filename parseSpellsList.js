import { readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mapping from "./mappings/spells-to-classes.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const spellNameMap = {};

const mountSpellNameMap = () => {
  const packPath = join(__dirname, "packs_source", "magias");
  const files = readdirSync(packPath);
  files.forEach((file) => {
    const data = JSON.parse(readFileSync(join(packPath, file), "utf8"));
    if (data.type === "spell") {
      if (spellNameMap[data.name.toLowerCase()]) {
        console.log("Duplicated spell name", data.name);
      }
      spellNameMap[data.name.toLowerCase()] = data._id;
    }
  });
  return spellNameMap;
};

const execute = async () => {
  mountSpellNameMap();

  const destPath = join(__dirname, "packs_source", "lista-de-magias");

  const files = readdirSync(destPath);
  for (const file of files) {
    console.log("Reading file", file);
    const data = JSON.parse(readFileSync(join(destPath, file), "utf8"));
    const newPages = [];
    for (const page of data.pages) {
      const id = page.system.identifier;
      const spellsMapping = mapping
        .filter((s) => s.Classes.toLowerCase().includes(id))
        .map((sl) => `Compendium.renegados-compendium.magias.Item.${spellNameMap[sl.Name.toLowerCase()]}`);
      console.log("Adding spells to class", id);
      const newPage = page;
      newPage.system.spells = spellsMapping;
      newPages.push(newPage);
    }
    data.pages = newPages;
    try {
      writeFileSync(join(destPath, file), JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error writing file", join(destPath, file), err);
    }
  }
};

execute();
