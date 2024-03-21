import { byMethod } from "@http/fns/by_method";
import { ok } from "@http/fns/response/ok";
import { generateWebhookToken } from "../lib/generate_webhook_token.ts";

export default byMethod({
  GET: () => ok(generateWebhookToken()),
});
