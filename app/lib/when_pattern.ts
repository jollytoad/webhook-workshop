import type { Awaitable, RoutePattern } from "$http_fns/types.ts";
import { asURLPattern } from "$http_fns/as_url_pattern.ts";

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
