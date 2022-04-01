const { exit, readFileSync, writeTextFileSync } = Deno;
import * as fs from "https://deno.land/std@0.133.0/fs/mod.ts";
import * as base64 from "https://deno.land/std@0.133.0/encoding/base64.ts";
import { cac } from "https://unpkg.com/cac@6.7.12/mod.ts";

const cli = cac("sjc");
cli
  .command("")
  .option("-i, --in <path>", "One or more in files to embed in the out file")
  .option("-o, --out <path>", "Out JSON file")
  .example((name) =>
    `${name} -i example1.ts -i example2.ts -i folder -o bundle.json`
  )
  .action((opts) => {
    const inPaths = [].concat(opts.in);
    const outPath = opts.out;
    const outObj: Record<string, string> = {};
    inPaths.forEach((inPath) => {
      for (const entry of fs.walkSync(inPath)) {
        if (entry.isDirectory) {
          continue;
        }
        console.log(">", entry.path);
        outObj[entry.path] = base64.encode(readFileSync(entry.path));
      }
    });
    const outText = JSON.stringify(outObj, null, 2);
    console.log("<", outPath);
    writeTextFileSync(outPath, outText);
  });

cli.help();
cli.version("1.0.0");

try {
  cli.parse();
} catch {
  exit(1);
}
