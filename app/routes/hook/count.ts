import { ok } from "$http_fns/response/ok.ts";
import { byWebhookEvent } from "../../../lib/by_webhook_event.ts";

export default byWebhookEvent("*", async (_req, eventData) => {
  const kv = await Deno.openKv();

  await kv.atomic().sum(["count", eventData.object_kind], 1n).commit();

  return ok();
});
