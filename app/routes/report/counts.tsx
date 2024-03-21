import { byMethod } from "@http/fns/by_method";
import { byMediaType } from "@http/fns/by_media_type";
import { html } from "@http/fns/response/html";
import { prependDocType } from "@http/fns/response/prepend_doctype";
import { renderBody } from "@http/jsx-stream";
import { kv } from "../../lib/kv.ts";

export default byMethod({
  GET: byMediaType({
    "text/html": () => html(prependDocType(renderBody(<Report />))),
  }),
});

function Report() {
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
          <h1>Webhook call counts</h1>
        </header>
        <main>
          <table>
            <thead>
              <tr>
                <th>Hook</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <ReportRows />
            </tbody>
          </table>
        </main>
      </body>
    </html>
  );
}

async function* ReportRows() {
  const iter = kv.list<Deno.KvU64>({ prefix: ["count"] });

  for await (const entry of iter) {
    const [, eventName] = entry.key;
    const count = entry.value.value;

    yield (
      <tr>
        <td>{eventName}</td>
        <td>{count}</td>
      </tr>
    );
  }
}
