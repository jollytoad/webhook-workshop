#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read --allow-write=./app/hooks.json

import { discoverRoutes } from "@http/discovery/discover-routes";
import { asURLPatterns } from "@http/route/as-url-pattern";

export async function generateHooksIndex() {
  console.debug("\nGenerating hooks index");

  const outUrl = new URL(import.meta.resolve("../app/hooks.json"));

  const routes = await discoverRoutes({
    fileRootUrl: import.meta.resolve("../app/routes"),
  });

  const hookPaths = routes
    .flatMap((route) => asURLPatterns(route.pattern))
    .map((pattern) => pattern.pathname)
    .filter((path) => path.startsWith("/hook"));

  console.log("Found hook paths:", hookPaths);

  const content = JSON.stringify(hookPaths, null, 2);

  let existingContent = undefined;

  if (await can("read", outUrl)) {
    try {
      existingContent = await Deno.readTextFile(outUrl);
    } catch {
      // Ignore error
    }
  }

  if (content !== existingContent) {
    console.debug("Writing new routes module:", outUrl.pathname);
    await Deno.writeTextFile(outUrl, content);
    return true;
  }

  return false;
}

async function can(
  name: "read" | "write",
  path: string | URL,
): Promise<boolean> {
  return (await Deno.permissions.query({ name, path })).state === "granted";
}

export default generateHooksIndex;

if (import.meta.main) {
  await generateHooksIndex();
}
