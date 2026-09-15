import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const english = JSON.parse(fs.readFileSync(path.join(root, "locales/en.json"), "utf8"));
const localeFiles = fs.readdirSync(path.join(root, "locales")).filter((file) => file.endsWith(".json") && file !== "en.json");
let missing = 0;
let fallback = 0;

for (const file of localeFiles) {
  const locale = JSON.parse(fs.readFileSync(path.join(root, "locales", file), "utf8"));
  const keys = Object.keys(english).filter((key) => !(key in locale));
  const fallbackKeys = Object.keys(english).filter((key) => key in locale && locale[key] === english[key]);
  missing += keys.length;
  fallback += fallbackKeys.length;
  console.log(`${file}: ${keys.length} missing, ${fallbackKeys.length} English fallback values`);
}

if (missing) {
  console.log(`\n${missing} translation keys are missing and will fall back to English.`);
  process.exitCode = 1;
} else {
  console.log(`\nAll locale files contain the complete English key set. ${fallback} values still use English and should receive human translation before claiming full localization.`);
}
