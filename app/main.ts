import handler from "./handler.ts";
import init from "$http_fns/hosting/init_deploy.ts";
import interceptors from "./interceptors.ts";
import { initBackgroundRequestListener } from "./lib/background.ts";

/**
 * This is the main production entry point of the server
 */

await initBackgroundRequestListener(handler);

await Deno.serve(await init(handler, ...interceptors)).finished;
