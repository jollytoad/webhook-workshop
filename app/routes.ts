// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byPattern } from "@http/fns/by_pattern";
import { cascade } from "@http/fns/cascade";
import route_1 from "./routes/token.ts";
import route_2 from "./routes/report/counts.tsx";
import route_3 from "./routes/hook/slow.ts";
import route_4 from "./routes/hook/queue.ts";
import route_5 from "./routes/hook/log.ts";
import route_6 from "./routes/hook/create-issue-on-fail.ts";
import route_7 from "./routes/hook/count.ts";
import route_8 from "./routes/index.tsx";

export default cascade(
  byPattern("/token", route_1),
  byPattern("/report/counts", route_2),
  byPattern("/hook/slow", route_3),
  byPattern("/hook/queue", route_4),
  byPattern("/hook/log", route_5),
  byPattern("/hook/create-issue-on-fail", route_6),
  byPattern("/hook/count", route_7),
  byPattern("/", route_8),
);
