import type { Awaitable, Interceptors, RoutePattern } from "$http_fns/types.ts";
import { verifyHeader } from "$http_fns/interceptor/verify_header.ts";
import { asURLPattern } from "$http_fns/as_url_pattern.ts";

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
    whenPattern(
      "/hook/*",
      verifyHeader({
        header: "X-Gitlab-Token",
        value: token,
      }),
    ),
  ],
}] satisfies Interceptors[];

// TODO: incorporate this into $http_fns...

export function whenPattern<A extends unknown[]>(
  pattern: RoutePattern,
  interceptor: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<Request | Response | void>,
): (request: Request, ...args: A) => Awaitable<Request | Response | void> {
  const patterns = Array.isArray(pattern)
    ? pattern.map(asURLPattern)
    : [asURLPattern(pattern)];

  return (req: Request, ...args: A) => {
    for (const pattern of patterns) {
      const match = pattern.exec(req.url);

      if (match) {
        return interceptor(req, match, ...args);
      }
    }
  };
}
