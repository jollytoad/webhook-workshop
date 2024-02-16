import { ok } from "$http_fns/response/ok.ts";
import { byWebhookEvent } from "../../lib/by_webhook_event.ts";

// deno-lint-ignore no-explicit-any
export default byWebhookEvent("*", async (_req, eventData: any) => {
  using kv = await Deno.openKv();

  await kv.atomic().sum(["count", eventData.object_kind], 1n).commit();

  return ok();
});
