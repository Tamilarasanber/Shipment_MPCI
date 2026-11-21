import fs from "fs";
import path from "path";

const root = "src/pages/DubaiMPCI";
const mui = new Set();
const icons = new Set();
const ext = new Set();

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(js|jsx)$/.test(file)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const match of text.matchAll(
      /import\s+\{([^}]+)\}\s+from\s+["']@mui\/material["']/g,
    )) {
      match[1]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((name) => mui.add(name.split(" as ")[0].trim()));
    }
    for (const match of text.matchAll(
      /import\s+(\w+)\s+from\s+["']@mui\/icons-material\/(\w+)["']/g,
    )) {
      icons.add(`${match[1]}:${match[2]}`);
    }
    for (const match of text.matchAll(/from\s+["']((?:\.\.\/){2,}[^"']+)["']/g)) {
      ext.add(match[1]);
    }
  }
}

walk(root);
console.log("MUI");
console.log([...mui].sort().join("\n"));
console.log("\nICONS");
console.log([...icons].sort().join("\n"));
console.log("\nEXT");
console.log([...ext].sort().join("\n"));
