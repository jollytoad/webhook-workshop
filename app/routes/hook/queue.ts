import { accepted } from "../../lib/accepted.ts";
import { byWebhookEvent } from "../../lib/by_webhook_event.ts";
import { getSearchValues } from "$http_fns/request/search_values.ts";

export default byWebhookEvent("*", async (req, eventData) => {
  const delay = parseInt(getSearchValues(req)("delay")[0] ?? "") || 0;

  using kv = await Deno.openKv();

  console.log("Queue event, delay:", delay);
  await kv.enqueue(eventData, {
    delay,
  });

  return accepted();
});

const kv = await Deno.openKv();

kv.listenQueue((data) => {
  console.log("Handle queued event", data);
});
