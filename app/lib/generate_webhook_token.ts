import { encodeBase58 as encode } from "@std/encoding/base58";

export function generateWebhookToken(prefix = "glwht-", bytes = 32) {
  return prefix + encode(crypto.getRandomValues(new Uint8Array(bytes)));
}
