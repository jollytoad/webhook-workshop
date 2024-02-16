import { byWebhookEvent } from "../../lib/by_webhook_event.ts";
import { background } from "../../lib/background.ts";
import { delay } from "$std/async/delay.ts";
import { ok } from "$http_fns/response/ok.ts";

const DURATION = 30;

export default background(
  // deno-lint-ignore no-explicit-any
  byWebhookEvent("*", async (_req, eventData: any, ...args) => {
    console.log(`Handling background event: ${eventData.object_kind}`);
    console.log("Args:", ...args);

    for (let i = 1; i <= DURATION; i++) {
      console.log(`${i}/${DURATION}`);
      await delay(1000);
    }

    console.log("Done");

    return ok();
  }),
);
