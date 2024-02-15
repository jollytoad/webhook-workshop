// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byPattern } from "$http_fns/by_pattern.ts";
import { cascade } from "$http_fns/cascade.ts";
import route_1 from "./routes/token.ts";
import route_2 from "./routes/report/counts.tsx";
import route_3 from "./routes/hook/slow.ts";
import route_4 from "./routes/hook/queue.ts";
import route_5 from "./routes/hook/log.ts";
import route_6 from "./routes/hook/count.ts";

export default cascade(
  byPattern("/token", route_1),
  byPattern("/report/counts", route_2),
  byPattern("/hook/slow", route_3),
  byPattern("/hook/queue", route_4),
  byPattern("/hook/log", route_5),
  byPattern("/hook/count", route_6),
);
