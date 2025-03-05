import { readdirSync, readFileSync, writeFileSync } from "fs";
import ora from "ora";
import { join } from "path";
import { PACK_SOURCE_PATH, PACKS } from "./constants.js";

const spellNameMap = {};

const mountSpellNameMap = () => {
  const spinner = ora("Mounting spell name map").start();
  const packPath = PACK_SOURCE_PATH("magias");
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
  spinner.succeed("Mounted spell name map");
  return spellNameMap;
};

export const execute = async () => {
  mountSpellNameMap();

  for (const pack of PACKS) {
    console.log(`reading ${pack} source`);
    const destPath = PACK_SOURCE_PATH(pack);

    const files = readdirSync(destPath);
    for (const file of files) {
      console.log("Reading file", file);
      const data = readFileSync(join(destPath, file), "utf8");
      if (data.includes("@spell")) {
        console.log("File with spells", file);
        let newData = data;
        const spells = newData.match(/@spell\[(.*?)\]/g);

        console.log("Spells", spells);
        if (!spells) {
          console.log("No spells found in", data.name);
          continue;
        }
        spells.forEach((spell) => {
          const spellName = spell.replace(/@spell\[|\]/g, "").toLowerCase();
          if (!spellNameMap[spellName]) {
            console.log("Spell not found", spellName);
          }
          console.log("Spell", spellNameMap[spellName], "in pack", data.name);
          newData = newData.replace(
            spell,
            `@UUID[Compendium.renegados-compendium.magias.Item.${spellNameMap[spellName]}]`,
          );
        });
        try {
          writeFileSync(join(destPath, file), JSON.stringify(JSON.parse(newData), null, 2));
        } catch (err) {
          console.error("Error writing file", join(destPath, file), err);
        }
      }
    }
  }
};
