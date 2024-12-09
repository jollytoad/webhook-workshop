import { ok } from "@http/response/ok";
import { generateWebhookToken } from "../lib/generate_webhook_token.ts";

export function GET() {
  return ok(generateWebhookToken());
}
