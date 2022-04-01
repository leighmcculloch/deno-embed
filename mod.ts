import * as fs from "https://deno.land/std@0.133.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.133.0/path/mod.ts";

export interface EmbedEntry extends Deno.DirEntry {
  contents?: Uint8Array;
}

export class Embed {
  private constructor(private entries: Record<string, EmbedEntry>) {}

  static from(o: Record<string, EmbedEntry>): Embed {
    return new Embed(o);
  }

  *walk(root: string): Generator<fs.WalkEntry> {
    let rootNorm = path.normalize(root);
    if (rootNorm == "." || rootNorm == "./") {
      rootNorm = "";
    }
    for (const p in this.entries) {
      if (!p.startsWith(rootNorm)) {
        continue;
      }
      const entry = this.entries[p];
      yield {
        path: p,
        ...entry,
      } as fs.WalkEntry;
    }
  }

  readFile(path: string): Uint8Array {
    const entry = this.entries[path];
    if (entry == undefined || entry.contents == undefined) {
      throw new Error("file not found");
    }
    return entry.contents;
  }

  readTextFile(path: string): string {
    const entry = this.entries[path];
    if (entry == undefined || entry.contents == undefined) {
      throw new Error("file not found");
    }
    return new TextDecoder().decode(entry.contents);
  }
}
