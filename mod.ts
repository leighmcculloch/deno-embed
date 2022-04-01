import * as fs from "https://deno.land/std@0.133.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.133.0/path/mod.ts";

export interface ImportedEmbedEntry extends Deno.DirEntry {
  contents?: Uint8Array | number[];
}

export interface EmbedEntry extends Deno.DirEntry {
  contents?: Uint8Array;
}

export class Embed {
  private constructor(private entries: Record<string, EmbedEntry>) {}

  static fromImported(imported: Record<string, ImportedEmbedEntry>): Embed {
    const entries: Record<string, EmbedEntry> = {};
    for (const path in imported) {
      const importedEntry = imported[path];
      entries[path] = {
        name: importedEntry.name,
        isDirectory: importedEntry.isDirectory,
        isFile: importedEntry.isFile,
        isSymlink: importedEntry.isSymlink,
      };
      if (importedEntry.contents !== undefined) {
        entries[path].contents = Uint8Array.from(importedEntry.contents);
      }
    }
    return new Embed(entries);
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
      let relPath = p.substring(rootNorm.length);
      if (relPath == "") relPath = ".";
      if (relPath[0] == "/") relPath = relPath.slice(1);
      const entry = this.entries[p];
      yield {
        path: relPath,
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
