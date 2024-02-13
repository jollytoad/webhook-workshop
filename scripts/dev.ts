import handler from "../handler.ts";
import init from "$http_fns/hosting/init_localhost.ts";

await Deno.serve(await init(handler)).finished;
