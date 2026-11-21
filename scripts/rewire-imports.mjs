import fs from "fs";
import path from "path";

const root = path.resolve("src/pages/DubaiMPCI");
const skip = new Set([
  path.normalize(path.join(root, "AgentDubaiMPCI.jsx")),
  path.normalize(path.join(root, "Components", "AgentMpciStatCard.jsx")),
]);

const replacements = [
  [/from\s+["']@mui\/material["']/g, 'from "@/components/ui/mui"'],
  [/from\s+["']@mui\/material\/styles["']/g, 'from "@/components/ui/mui"'],
  [/from\s+["']@mui\/lab\/TabContext["']/g, 'from "@/components/ui/mui"'],
  [/from\s+["']@mui\/lab\/TabPanel["']/g, 'from "@/components/ui/mui"'],
  [/from\s+["']react-icons\/sl["']/g, 'from "@/components/ui/icons"'],
  [/from\s+["'][^"']*Redux\/Actions\/DubaiMPCIAction["']/g, 'from "@/redux/actions/dubaiMpciAction"'],
  [/from\s+["'][^"']*Environment\/Environment["']/g, 'from "@/environment/environment"'],
  [/from\s+["'][^"']*Components\/Input\/FormikFields["']/g, 'from "@/components/ui/FormikFields"'],
  [/from\s+["'][^"']*Components\/Input\/SearchableAutocomplete["']/g, 'from "@/components/ui/SearchableAutocomplete"'],
  [/from\s+["'][^"']*Components\/Input\/FormikPreloadedAutocomplete["']/g, 'from "@/components/ui/FormikPreloadedAutocomplete"'],
  [/from\s+["'][^"']*Components\/Input\/SearchableMultiAutocomplete["']/g, 'from "@/components/ui/SearchableMultiAutocomplete"'],
  [/from\s+["'][^"']*Components\/Button\/ProgressButton["']/g, 'from "@/components/ui/ProgressButton"'],
  [/from\s+["'][^"']*Components\/Button\/ConfirmDeletePopover["']/g, 'from "@/components/ui/ConfirmDeletePopover"'],
  [/from\s+["'][^"']*Components\/Core-Components\/CountryFlag["']/g, 'from "@/components/ui/CountryFlag"'],
  [/from\s+["'][^"']*Components\/AccodionCard\/AccordionCard["']/g, 'from "@/components/ui/AccordionCard"'],
  [/from\s+["'][^"']*Providers\/Loading\/LoadingComponent["']/g, 'from "@/components/ui/LoadingComponent"'],
  [/from\s+["'][^"']*Components\/TruncateText\/TruncateText["']/g, 'from "@/components/ui/TruncateText"'],
  [/from\s+["'][^"']*Configs\/App\.config["']/g, 'from "@/configs/http"'],
  [/\/NXT\/DubaiMPCI\/MPCIFiling/g, "/uae-mpci/filing"],
];

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(js|jsx)$/.test(file) || skip.has(path.normalize(full))) continue;
    let text = fs.readFileSync(full, "utf8");
    const original = text;
    text = text.replace(
      /import\s+(\w+)\s+from\s+["']@mui\/icons-material\/[^"']+["'];?/g,
      'import { $1 } from "@/components/ui/icons";',
    );
    replacements.forEach(([pattern, value]) => {
      text = text.replace(pattern, value);
    });
    if (text !== original) fs.writeFileSync(full, text);
  }
}

walk(root);
console.log("rewired");
