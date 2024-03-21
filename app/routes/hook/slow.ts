import { ok } from "@http/fns/response/ok";
import { delay } from "@std/async/delay";
import { getSearchValues } from "@http/fns/request/search_values";
import { byWebhookEvent } from "../../lib/by_webhook_event.ts";

export default byWebhookEvent("*", async (req) => {
  const time = parseInt(getSearchValues(req)("time")[0] ?? "") || 1000;

  await delay(time);

  return ok();
});
