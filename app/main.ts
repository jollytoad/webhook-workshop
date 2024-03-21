import handler from "./handler.ts";
import init from "@http/fns/hosting/init_deploy";
import interceptors from "./interceptors.ts";
import { initBackgroundRequestListener } from "./lib/background.ts";
import { initKv } from "./lib/kv.ts";

/**
 * This is the main production entry point of the server
 */

await initKv();
await initBackgroundRequestListener(handler);

await Deno.serve(await init(handler, ...interceptors)).finished;
