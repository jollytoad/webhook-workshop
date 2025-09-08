import type { Interceptors } from "@http/interceptor/types";
import { verifyHeader } from "@http/interceptor/verify-header";
import { whenPattern } from "@http/interceptor/when-pattern";
import { applyForwardedHeaders } from "@http/interceptor/apply-forwarded-headers";

const TOKEN_VAR = "GITLAB_WEBHOOK_TOKEN";
const token = Deno.env.get(TOKEN_VAR);

if (token) {
  console.info(`%c${TOKEN_VAR} is set`, "color: green;");
} else {
  console.warn(
    `%cWARNING: ${TOKEN_VAR} is not set, webhooks will NOT verify X-Gitlab-Token`,
    "color: red; font-weight: bold;",
  );
}

export default [{
  request: [
    applyForwardedHeaders,
    whenPattern(
      "/hook/*",
      verifyHeader({
        header: "X-Gitlab-Token",
        value: token,
      }),
    ),
  ],
}] satisfies Interceptors[];
