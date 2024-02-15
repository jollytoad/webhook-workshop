// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byPattern } from "$http_fns/by_pattern.ts";
import { cascade } from "$http_fns/cascade.ts";
import { lazy } from "$http_fns/lazy.ts";

export default cascade(
  byPattern("/report/counts", lazy(() => import("./routes/report/counts.tsx"))),
  byPattern("/hook/log", lazy(() => import("./routes/hook/log.ts"))),
  byPattern("/hook/count", lazy(() => import("./routes/hook/count.ts"))),
);
