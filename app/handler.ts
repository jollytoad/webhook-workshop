import { cascade } from "@http/route/cascade";
import { byPattern } from "@http/route/by-pattern";
import routes from "./routes.ts";
import index from "./routes/index.tsx";
import { interceptResponse } from "@http/interceptor/intercept-response";
import { methodNotAllowed } from "@http/response/method-not-allowed";

/**
 * This is the main request handler of the server
 */
export default cascade(
  interceptResponse(routes, (req, res) => {
    if (
      req.method === "GET" && res && (res.status === 404 || res.status === 405)
    ) {
      const path = new URL(req.url).pathname;
      if (path.startsWith("/hook/")) {
        return methodNotAllowed(
          "This is a webhook, it is designed to be called via a POST method",
        );
      }
    }
  }),
  byPattern(["/index{.:ext}?", "/hook{.:ext}?"], index),
);
