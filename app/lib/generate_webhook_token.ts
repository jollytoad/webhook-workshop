import { encodeBase58 as encode } from "$std/encoding/base58.ts";

export function generateWebhookToken(prefix = "glwht-", bytes = 32) {
  return prefix + encode(crypto.getRandomValues(new Uint8Array(bytes)));
}
