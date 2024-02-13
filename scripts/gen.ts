import { generateRoutesModule } from "$http_fns/generate_routes_module.ts";

function generateRoutes() {
  console.debug("Generating routes");

  return generateRoutesModule({
    fileRootUrl: import.meta.resolve("../app/routes"),
    moduleOutUrl: import.meta.resolve("../app/routes.ts"),
    httpFns: "$http_fns/",
    verbose: true,
  });
}

export default generateRoutes;

if (import.meta.main) {
  await generateRoutes();
}
