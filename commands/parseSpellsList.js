import { readdirSync, readFileSync, writeFileSync } from "fs";
import ora from "ora";
import { join } from "path";
import { PACK_SOURCE_PATH } from "./constants.js";
import mapping from "./mappings/spells-to-classes.json" with { type: "json" };

const spellNameMap = {};

const mountSpellNameMap = () => {
  const spinner = ora("Mounting spell name map").start();
  const packPath = PACK_SOURCE_PATH("magias");
  const files = readdirSync(packPath);
  files.forEach((file) => {
    spinner.text = `Reading file ${file}`;
    const data = JSON.parse(readFileSync(join(packPath, file), "utf8"));
    if (data.type === "spell") {
      if (spellNameMap[data.name.toLowerCase()]) {
        console.warn("Duplicated spell name", data.name);
      }
      spellNameMap[data.name.toLowerCase()] = data._id;
    }
  });
  spinner.succeed("Mounted spell name map");
  return spellNameMap;
};

export const execute = async () => {
  mountSpellNameMap();

  const destPath = PACK_SOURCE_PATH("lista-de-magias");

  const files = readdirSync(destPath);
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(destPath, file), "utf8"));
    const newPages = [];
    for (const page of data.pages) {
      const id = page.system.identifier;
      const spinner = ora(`Parsing spells for ${id}`).start();
      const spellsMapping = mapping
        .filter((s) => s.Classes.toLowerCase().includes(id))
        .map((sl) => {
          const spellName = sl.Name.toLowerCase();
          if (!spellNameMap[spellName]) {
            console.warn("Spell not found", spellName);
          }
          spinner.text = `Adding spell ${spellNameMap[spellName]} to class ${id}`;
          return `Compendium.renegados-compendium.magias.Item.${spellNameMap[sl.Name.toLowerCase()]}`;
        });
      const newPage = page;
      newPage.system.spells = spellsMapping;
      newPages.push(newPage);
      spinner.succeed(`Parsed spells for ${id}`);
    }
    data.pages = newPages;
    try {
      writeFileSync(join(destPath, file), JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error writing file", join(destPath, file), err);
    }
  }
};
