import handler from "../app/handler.ts";
import init from "$http_fns/hosting/init_localhost.ts";
import generateRoutes from "./gen.ts";
import interceptors from "../app/interceptors.ts";

/**
 * This is the development time entry point of the server
 */

await generateRoutes();

await Deno.serve(await init(handler, ...interceptors)).finished;
