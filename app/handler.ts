import { cascade } from "$http_fns/cascade.ts";
import { ok } from "$http_fns/response/ok.ts";
import { badRequest } from "$http_fns/response/bad_request.ts";
import type { WebhookEvents } from "gitlab-event-types";

export default cascade(
  async (req: Request) => {
    const hookName = req.headers.get("X-GitLab-Event");
    const instance = req.headers.get("X-GitLab-Instance");
    const userAgent = req.headers.get("User-Agent");

    try {
      const eventData = (await req.json()) as WebhookEvents;

      console.log(`${hookName} from ${instance} (${userAgent})`);
      console.log(JSON.stringify(eventData, null, 2));

      return ok();
    } catch {
      // Failed to parse event data
      return badRequest();
    }
  },
);
