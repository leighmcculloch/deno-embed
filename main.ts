import * as fs from "https://deno.land/std@0.133.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.133.0/path/mod.ts";
import { cac } from "https://unpkg.com/cac@6.7.12/mod.ts";

function embed(inPaths: string[], outPath: string) {
  const outObj: Record<string, Deno.DirEntry> = {};
  inPaths.forEach((inPath) => {
    for (const entry of fs.walkSync(inPath)) {
      if (entry.isDirectory) {
        console.log(">", entry.path, "(dir)");
        outObj[entry.path] = {
          name: entry.path,
          isDirectory: true,
          isFile: false,
          isSymlink: false,
        } as Deno.DirEntry;
      } else if (entry.isFile) {
        const fileInfo = Deno.statSync(entry.path);
        console.log(">", entry.path, `(file, ${fileInfo.size}B)`);
        outObj[entry.path] = {
          name: entry.path,
          isDirectory: false,
          isFile: true,
          isSymlink: false,
          contents: Array.from(Deno.readFileSync(entry.path)),
        } as Deno.DirEntry;
      }
    }
  });
  const outText = JSON.stringify(outObj, null, 2);
  console.log("<", outPath);
  Deno.writeTextFileSync(outPath, outText);
}

const cli = cac("sjc");
cli
  .command("")
  .option("-i, --in <path>", "One or more in files to embed in the out file")
  .option("-o, --out <path>", "Out JSON file")
  .example((name) =>
    `${name} -i example1.ts -i example2.ts -i folder -o bundle.json`
  )
  .action((opts) => {
    const inPaths = [].concat(opts.in).map((p) => path.normalize(p));
    const outPath = opts.out;
    embed(inPaths, outPath);
  });

cli.help();
cli.version("0.1.0");

try {
  cli.parse();
} catch {
  Deno.exit(1);
}
