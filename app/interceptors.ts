import type { Interceptors } from "$http_fns/types.ts";
import { verifyHeader } from "$http_fns/interceptor/verify_header.ts";

const TOKEN_VAR = "GITLAB_WEBHOOK_TOKEN";
const token = Deno.env.get(TOKEN_VAR);

if (token) {
  console.info(`%c${TOKEN_VAR} is set`, 'color: green;');
} else {
  console.warn(`%cWARNING: ${TOKEN_VAR} is not set, webhooks will NOT verify X-Gitlab-Token`, 'color: red; font-weight: bold;');
}

export default [{
  request: [
    verifyHeader({
      header: "X-Gitlab-Token",
      value: token,
    }),
  ],
}] satisfies Interceptors[];
