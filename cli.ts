import * as fs from "https://deno.land/std@0.133.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.133.0/path/mod.ts";
import { cac } from "https://unpkg.com/cac@6.7.12/mod.ts";

function embed(inPaths: string[], outPath: string) {
  const outObj: Record<string, Deno.DirEntry> = {};
  const addDir = (p: string) => {
    console.log(">", p, "(dir)");
    outObj[p] = {
      name: path.basename(p),
      isDirectory: true,
      isFile: false,
      isSymlink: false,
    } as Deno.DirEntry;
  };
  const addFile = (p: string) => {
    const fileInfo = Deno.statSync(p);
    console.log(">", p, `(file, ${fileInfo.size}B)`);
    outObj[p] = {
      name: path.basename(p),
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Array.from(Deno.readFileSync(p)),
    } as Deno.DirEntry;
  };
  inPaths.forEach((inPath) => {
    const inPathInfo = Deno.statSync(inPath);
    if (inPathInfo.isFile) {
      addFile(inPath);
    } else {
      for (const entry of fs.walkSync(inPath)) {
        if (entry.isDirectory) {
          addDir(entry.path);
        } else if (entry.isFile) {
          addFile(entry.path);
        }
      }
    }
  });
  const outText = JSON.stringify(outObj, null, 2);
  console.log("<", outPath);
  Deno.writeTextFileSync(outPath, outText);
}

const cli = cac("embed");
cli.command("", "Embed in files in the out JSON", { allowUnknownOptions: false })
  .usage("-i <path> -o <path>")
  .option("-i, --in <path>", "Files to embed in JSON file", { type: [] })
  .option("-o, --out <path>", "Out JSON file")
  .example((name) => `${name} -i file1.ts -i dir -o embed.json`)
  .action((opts) => {
    const inPaths = [].concat(opts.in).map((p) => path.normalize(p));
    const outPath = opts.out;
    embed(inPaths, outPath);
  });

cli.help();
cli.version("0.2.5");

try {
  cli.parse();
} catch (error) {
  console.error(error.message);
}
