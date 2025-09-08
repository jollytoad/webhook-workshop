import { ok } from "@http/response/ok";

export default async function (req: Request): Promise<Response> {
  console.debug("%c--- Headers: ---", "font-weight: bold");
  console.debug(req.headers);

  const body = await req.text();

  console.debug("%c--- Body: ---", "font-weight: bold");
  try {
    const data = JSON.parse(body);
    console.debug(JSON.stringify(data, undefined, 2));
  } catch {
    console.debug(body);
  }

  return ok();
}
