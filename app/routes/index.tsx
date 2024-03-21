import { byMethod } from "@http/fns/by_method";
import { byMediaType } from "@http/fns/by_media_type";
import { ok } from "@http/fns/response/ok";
import { html } from "@http/fns/response/html";
import { json } from "@http/fns/response/json";
import { prependDocType } from "@http/fns/response/prepend_doctype";
import { renderBody } from "@http/jsx-stream";
import hookPaths from "../hooks.json" with { type: "json" };

export default byMethod({
  GET: byMediaType({
    "text/html": (req) =>
      html(prependDocType(renderBody(<IndexPage {...asProps(req)} />))),
    "application/json": (req) => json(asProps(req)),
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
