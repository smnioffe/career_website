import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const templatePath = resolve(root, "src/templates/index.template.html");
const outputPath = resolve(root, "index.html");

const partials = {
  EXPERIENCE_CARD_BODY: readFileSync(
    resolve(root, "src/partials/experience-card-body.html"),
    "utf8"
  ),
};

let template = readFileSync(templatePath, "utf8");

for (const [key, value] of Object.entries(partials)) {
  template = template.replace(`{{${key}}}`, value.trimEnd());
}

const unresolved = template.match(/{{[A-Z0-9_]+}}/g);
if (unresolved) {
  throw new Error(`Unresolved template tokens: ${unresolved.join(", ")}`);
}

writeFileSync(outputPath, template);
console.log("Built index.html from src/templates/index.template.html");
