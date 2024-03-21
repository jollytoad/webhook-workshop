import { cascade } from "@http/fns/cascade";
import { byPattern } from "@http/fns/by_pattern";
import routes from "./routes.ts";
import index from "./routes/index.tsx";
import { interceptResponse } from "@http/fns/intercept";
import { methodNotAllowed } from "@http/fns/response/method_not_allowed";

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
