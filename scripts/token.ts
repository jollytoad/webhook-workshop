#!/usr/bin/env -S deno run

import { generateWebhookToken } from "../app/lib/generate_webhook_token.ts";

console.log(generateWebhookToken());
