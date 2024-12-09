#!/usr/bin/env -S deno run --allow-net --allow-env --env --allow-read --allow-write=./app/routes.ts,./app/hooks.json --watch

import handler from "../app/handler.ts";
import init from "@http/host-deno-local/init";
import generateRoutes from "./gen.ts";
import interceptors from "../app/interceptors.ts";
import { initBackgroundRequestListener } from "../app/lib/background.ts";
import { intercept } from "@http/interceptor/intercept";
import { withFallback } from "@http/route/with-fallback";
import { logging } from "@http/interceptor/logger";
import { initKv } from "../app/lib/kv.ts";
import generateHooksIndex from "./gen_hooks_index.ts";

/**
 * This is the development time entry point of the server
 */

console.debug(Deno.version);

await generateRoutes();
await generateHooksIndex();

await initKv();
await initBackgroundRequestListener(
  intercept(withFallback(handler), logging()),
);

await Deno.serve(await init(handler, ...interceptors)).finished;
