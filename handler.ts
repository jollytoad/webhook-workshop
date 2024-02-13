import { cascade } from "$http_fns/cascade.ts";
import { ok } from "$http_fns/response/ok.ts";
import type { WebhookEvents } from "npm:gitlab-event-types";

export default cascade(
  async (req: Request) => {
    const eventName = req.headers.get("X-GitLab-Event");

    const eventData = (await req.json()) as WebhookEvents;

    console.log("GitLab Event:", eventName);
    console.log(JSON.stringify(eventData, null, 2));

    return ok();
  },
);
