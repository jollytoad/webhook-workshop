import { ok } from "$http_fns/response/ok.ts";
import { badRequest } from "$http_fns/response/bad_request.ts";
import type { WebhookEvents } from "gitlab-event-types";

export default async (req: Request) => {
  const hookName = req.headers.get("X-GitLab-Event");
  const instance = req.headers.get("X-GitLab-Instance");
  const userAgent = req.headers.get("User-Agent");

  try {
    const eventData = (await req.json()) as WebhookEvents;

    console.log(`${hookName} from ${instance} (${userAgent})`);

    console.groupCollapsed("Headers...");
    for (const [name, value] of req.headers.entries()) {
      console.log(`${name}: ${value}`);
    }
    console.groupEnd();

    console.groupCollapsed("Event body...");
    console.log(JSON.stringify(eventData, null, 2));
    console.groupEnd();

    return ok();
  } catch {
    // Failed to parse event data
    return badRequest();
  }
};
