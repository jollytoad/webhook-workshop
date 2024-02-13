import { cascade } from "$http_fns/cascade.ts";
import routes from "./routes.ts";

/**
 * This is the main request handler of the server
 */
export default cascade(
  routes,
);
