#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read --allow-write=./app/routes.ts,./app/hooks.json

import { generateRoutesModule } from "@http/generate/generate-routes-module";
import { dprintFormatModule } from "@http/generate/dprint-format-module";
import { generateHooksIndex } from "./gen_hooks_index.ts";

function generateRoutes() {
  console.debug("\nGenerating routes");

  return generateRoutesModule({
    fileRootUrl: import.meta.resolve("../app/routes"),
    moduleOutUrl: import.meta.resolve("../app/routes.ts"),
    moduleImports: "static",
    formatModule: dprintFormatModule(),
    verbose: true,
  });
}

export default generateRoutes;

if (import.meta.main) {
  await generateRoutes();
  await generateHooksIndex();
}
