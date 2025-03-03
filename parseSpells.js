import { readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

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

const packs = ["subclasses", "racas", "classes", "classes-e-subclasses-features"];

const execute = async () => {
  mountSpellNameMap();

  for (const pack of packs) {
    console.log(`reading ${pack} source`);
    const destPath = join(__dirname, "packs_source", pack);

    const files = readdirSync(destPath);
    for (const file of files) {
      console.log("Reading file", file);
      const data = JSON.parse(readFileSync(join(destPath, file), "utf8"));
      if (
        ["subclass", "race", "class", "feat"].includes(data.type) &&
        data.system.description.value.includes("@spell")
      ) {
        console.log("Pack with spells", data.name);
        let description = data.system.description.value;
        const spells = description.match(/@spell\[(.*?)\]/g);

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
          description = description.replace(
            spell,
            `@UUID[Compendium.renegados-compendium.magias.Item.${spellNameMap[spellName]}]`,
          );
        });
        data.system.description.value = description;
        try {
          writeFileSync(join(destPath, file), JSON.stringify(data, null, 2));
        } catch (err) {
          console.error("Error writing file", join(destPath, file), err);
        }
      }
    }
  }
};

execute();
