import { ok } from "$http_fns/response/ok.ts";
import { delay } from "$std/async/delay.ts";
import { getSearchValues } from "$http_fns/request/search_values.ts";

export default async function (req: Request) {
  const time = parseInt(getSearchValues(req)("time")[0] ?? "") || 1000;

  await delay(time);

  return ok();
}
