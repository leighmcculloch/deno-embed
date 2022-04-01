# deno-embed

Embed files into deno applications by embedding them into a JSON file and importing natively into the deno app.

## Usage

```
deno run --allow-read --allow-write https://github.com/leighmcculloch/deno-embed/raw/main/main.ts -i file1 -i file2 -o embed.json
```

```ts
import * as base64 from "https://deno.land/std/encoding/base64.ts";
import embed from "./embed.json" assert { type: "json" };
console.log(base64.decode(file.file1));
```
