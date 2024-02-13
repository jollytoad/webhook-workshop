// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byPattern } from "$http_fns/by_pattern.ts";
import { cascade } from "$http_fns/cascade.ts";
import { lazy } from "$http_fns/lazy.ts";

export default cascade(
  byPattern("/hook/log", lazy(() => import("./routes/hook/log.ts"))),
);
