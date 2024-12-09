import { byMethod } from "@http/route/by-method";
import { byMediaType } from "@http/route/by-media-type";
import { renderHtmlResponse } from "@http/html-stream/render-html-response";
import { kv } from "../../lib/kv.ts";

export default byMethod({
  GET: byMediaType({
    "text/html": () => renderHtmlResponse(<Report />),
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
