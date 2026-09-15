import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const localeDir = path.join(root, "locales");
const english = JSON.parse(fs.readFileSync(path.join(localeDir, "en.json"), "utf8"));

for (const file of fs.readdirSync(localeDir).filter((name) => name.endsWith(".json") && name !== "en.json")) {
  const filePath = path.join(localeDir, file);
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const completed = { ...english, ...locale };
  fs.writeFileSync(filePath, `${JSON.stringify(completed)}\n`);
}

console.log("Completed locale schemas with English fallback values where translations were missing.");
