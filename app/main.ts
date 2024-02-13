import handler from "./handler.ts";
import init from "$http_fns/hosting/init_deploy.ts";

/**
 * This is the main entry point of the server
 */
await Deno.serve(await init(handler)).finished;
