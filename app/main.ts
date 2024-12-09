#!/usr/bin/env -S deno run --allow-net --allow-env

import handler from "./handler.ts";
import init from "@http/host-deno-deploy/init";
import interceptors from "./interceptors.ts";
import { initBackgroundRequestListener } from "./lib/background.ts";
import { initKv } from "./lib/kv.ts";

/**
 * This is the main production entry point of the server
 */

await initKv();
await initBackgroundRequestListener(handler);

await Deno.serve(await init(handler, ...interceptors)).finished;
