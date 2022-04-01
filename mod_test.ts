import * as t from "https://deno.land/std@0.133.0/testing/asserts.ts";
import { Embed } from "./mod.ts";

Deno.test("readFileTextSync file not found", () => {
  const e = Embed.from({});
  t.assertThrows(() => e.readTextFile("file"), Error, "file not found");
});

Deno.test("readFileTextSync file found", () => {
  const e = Embed.from({
    "file": {
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents1").map((c) => c.charCodeAt(0)),
      ),
    },
    "dir": {
      name: "dir",
      isDirectory: true,
      isFile: false,
      isSymlink: false,
    },
    "dir/file": {
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents2").map((c) => c.charCodeAt(0)),
      ),
    },
  });

  t.assertEquals(e.readTextFile("file"), "contents1");
  t.assertEquals(e.readTextFile("dir/file"), "contents2");
});

Deno.test("walk", () => {
  const e = Embed.from({
    "file": {
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents1").map((c) => c.charCodeAt(0)),
      ),
    },
    "dir": {
      name: "dir",
      isDirectory: true,
      isFile: false,
      isSymlink: false,
    },
    "dir/file": {
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents2").map((c) => c.charCodeAt(0)),
      ),
    },
  });

  const g1 = e.walk("");
  t.assertEquals(
    g1.next().value,
    {
      path: "file",
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents1").map((c) => c.charCodeAt(0)),
      ),
    },
  );
  t.assertEquals(
    g1.next().value,
    {
      path: "dir",
      name: "dir",
      isDirectory: true,
      isFile: false,
      isSymlink: false,
    },
  );
  t.assertEquals(
    g1.next().value,
    {
      path: "dir/file",
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents2").map((c) => c.charCodeAt(0)),
      ),
    },
  );
  t.assertEquals(g1.next().value, undefined);
});

Deno.test("walk sub dir", () => {
  const e = Embed.from({
    "file": {
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents1").map((c) => c.charCodeAt(0)),
      ),
    },
    "dir": {
      name: "dir",
      isDirectory: true,
      isFile: false,
      isSymlink: false,
    },
    "dir/file": {
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents2").map((c) => c.charCodeAt(0)),
      ),
    },
  });

  const g1 = e.walk("dir");
  t.assertEquals(
    g1.next().value,
    {
      path: "dir",
      name: "dir",
      isDirectory: true,
      isFile: false,
      isSymlink: false,
    },
  );
  t.assertEquals(
    g1.next().value,
    {
      path: "dir/file",
      name: "file",
      isDirectory: false,
      isFile: true,
      isSymlink: false,
      contents: Uint8Array.from(
        Array.from("contents2").map((c) => c.charCodeAt(0)),
      ),
    },
  );
  t.assertEquals(g1.next().value, undefined);
});
