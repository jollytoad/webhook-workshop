import type { Awaitable } from "$http_fns/types.ts";
import { accepted } from "$http_fns/response/accepted.ts";
import { badRequest } from "$http_fns/response/bad_request.ts";

export interface BackgroundRequest {
  kind: "request";
  request: {
    url: string;
    method: string;
    headers: [string, string][];
    body?: Uint8Array;
  };
}

const BACKGROUND_TOKEN_HEADER = "X-Background-Token";

const BACKGROUND_TOKEN_VALUE = Deno.env.get("BACKGROUND_TOKEN") ??
  "453d4dfc-41e4-43f5-97fc-82ef2b42bdf1";

/**
 * Process a Request in the background.
 *
 * This wraps a regular handler, creating a new handler that pushes the Request
 * into a queue and immediately responds with a `202 Accepted`.
 *
 * The wrapped handler is then called at a later time in a background process.
 *
 * This is most useful for creating webhooks that need to respond within a
 * short timeframe but don't need to return any content immediately.
 *
 * The requests are enqueued to Deno Kv, and therefore for the background requests
 * to be processed a Kv queue listener must be registered using
 * `initBackgroundRequestListener()`.
 *
 * @param handler the handler to run in the background.
 * @returns A Request handler that always responds with `202 Accepted`
 */
export function background<A extends []>(
  handler: (request: Request, ...args: A) => Awaitable<Response | null>,
) {
  return async (req: Request, ...args: A) => {
    if (!req.headers.has(BACKGROUND_TOKEN_HEADER)) {
      // We are handling the real request

      // We add an extra header that will be used to identify that the request
      // has been queued and is due for processing
      const headers: [string, string][] = [
        [BACKGROUND_TOKEN_HEADER, BACKGROUND_TOKEN_VALUE],
        ...req.headers,
      ];

      const body = req.body
        ? new Uint8Array(await req.arrayBuffer())
        : undefined;

      const backgroundRequest: BackgroundRequest = {
        kind: "request",
        request: {
          url: req.url,
          method: req.method,
          headers,
          body,
        },
      };

      using kv = await Deno.openKv();

      console.debug("Enqueue", backgroundRequest);
      await kv.enqueue(backgroundRequest);

      return accepted();
    } else {
      // We are handling the background request

      if (req.headers.get(BACKGROUND_TOKEN_HEADER) !== BACKGROUND_TOKEN_VALUE) {
        return badRequest(`Invalid ${BACKGROUND_TOKEN_HEADER}`);
      }

      return handler(req, ...args);
    }
  };
}

export async function initBackgroundRequestListener(
  handler: (req: Request) => Awaitable<Response | null>,
) {
  const kv = await Deno.openKv();

  kv.listenQueue(backgroundRequestListener(handler));
}

export function backgroundRequestListener(
  handler: (req: Request) => Awaitable<Response | null>,
) {
  return async (message: unknown) => {
    if (isBackgroundRequest(message)) {
      const { url, method, headers, body } = message.request;

      const request = new Request(url, {
        method,
        headers,
        body,
      });

      console.debug("Background", request);

      await handler(request);
    }
  };
}

function isBackgroundRequest(message: unknown): message is BackgroundRequest {
  return !!message && typeof message === "object" &&
    "kind" in message && message.kind === "request" &&
    "request" in message && !!message.request &&
    typeof message.request === "object" &&
    "url" in message.request && !!message.request.url &&
    typeof message.request.url === "string" &&
    URL.canParse(message.request.url) &&
    "method" in message.request && !!message.request.method &&
    typeof message.request.method === "string" &&
    "headers" in message.request && !!message.request.headers &&
    Array.isArray(message.request.headers);
}
