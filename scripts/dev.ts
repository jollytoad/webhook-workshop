import handler from "../app/handler.ts";
import init from "$http_fns/hosting/init_localhost.ts";
import generateRoutes from "./gen.ts";
import interceptors from "../app/interceptors.ts";
import { initBackgroundRequestListener } from "../app/lib/background.ts";
import { intercept } from "$http_fns/intercept.ts";
import { withFallback } from "$http_fns/with_fallback.ts";
import { logging } from "$http_fns/interceptor/logger.ts";
import { initKv } from "../app/lib/kv.ts";

/**
 * This is the development time entry point of the server
 */

await generateRoutes();

await initKv();
await initBackgroundRequestListener(
  intercept(withFallback(handler), logging()),
);

await Deno.serve(await init(handler, ...interceptors)).finished;
