import { ok } from "$http_fns/response/ok.ts";
import { byWebhookEvent } from "../../lib/by_webhook_event.ts";
import { kv } from "../../lib/kv.ts";

// deno-lint-ignore no-explicit-any
export default byWebhookEvent("*", async (_req, eventData: any) => {
  await kv.atomic().sum(["count", eventData.object_kind], 1n).commit();
  return ok();
});
