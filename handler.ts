import { cascade } from "$http_fns/cascade.ts";
import { ok } from "$http_fns/response/ok.ts";

export default cascade(
  (req: Request) => {
    const event = req.headers.get("X-GitLab-Event");

    console.log("GitLab Event:", event);

    return ok();
  },
);
