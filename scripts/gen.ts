import { generateRoutesModule } from "@http/fns/generate_routes_module";
import { generateHooksIndex } from "./gen_hooks_index.ts";

function generateRoutes() {
  console.debug("\nGenerating routes");

  return generateRoutesModule({
    fileRootUrl: import.meta.resolve("../app/routes"),
    moduleOutUrl: import.meta.resolve("../app/routes.ts"),
    httpFns: "@http/fns/",
    jsr: true,
    moduleImports: "static",
    verbose: true,
  });
}

export default generateRoutes;

if (import.meta.main) {
  await generateRoutes();
  await generateHooksIndex();
}
