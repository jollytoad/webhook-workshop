import { byMethod } from "$http_fns/by_method.ts";
import { ok } from "$http_fns/response/ok.ts";
import { generateWebhookToken } from "../lib/generate_webhook_token.ts";

export default byMethod({
  GET: () => ok(generateWebhookToken()),
});
