import { byMethod } from "$http_fns/by_method.ts";
import { byMediaType } from "$http_fns/by_media_type.ts";
import { mapData } from "$http_fns/map_data.ts";
import { renderHTML } from "$http_render_fns/render_html.tsx";
import { renderJSON } from "$http_render_fns/render_json.ts";
import { ok } from "$http_fns/response/ok.ts";
import hookPaths from "../hooks.json" with { type: "json" };

export default byMethod({
  GET: byMediaType({
    "text/html": mapData(asProps, renderHTML(IndexPage)),
    "application/json": mapData(asProps, renderJSON()),
    "text/plain": (_req) => ok("Webhook Server Active"),
  }),
});

interface Props {
  webhooks: Record<string, string>;
}

function asProps(req: Request): Props {
  const webhooks: Record<string, string> = {};
  for (const path of hookPaths) {
    webhooks[path.replace(/^\/hook\//, "")] = new URL(path, req.url).href;
  }
  return { webhooks };
}

function IndexPage({ webhooks }: Props) {
  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/missing.css@1.1.1/dist/missing.min.css"
        />
      </head>
      <body>
        <header>
          <h1>Webhook Service</h1>
        </header>
        <main>
          <p>This is your webhook server, here are your available hooks:</p>
          <ul>
            {Object.entries(webhooks).map(([name, url]) => (
              <li>
                <a href={url}>{name}</a>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
