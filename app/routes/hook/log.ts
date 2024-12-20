import { ok } from "@http/response/ok";
import { byWebhookEvent } from "../../lib/by_webhook_event.ts";

export default byWebhookEvent("*", (req, eventData) => {
  const hookName = req.headers.get("X-GitLab-Event");
  const instance = req.headers.get("X-GitLab-Instance");
  const userAgent = req.headers.get("User-Agent");

  console.log(`%c${hookName} from ${instance} (${userAgent})`, "color: purple");

  console.groupCollapsed("%cHeaders...", "font-weight: bold");
  for (const [name, value] of req.headers.entries()) {
    console.log(`${name}: ${value}`);
  }
  console.groupEnd();

  console.groupCollapsed("%cEvent body...", "font-weight: bold");
  console.log(JSON.stringify(eventData, null, 2));
  console.groupEnd();

  return ok();
});
