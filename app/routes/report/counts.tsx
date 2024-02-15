import { byMethod } from "$http_fns/by_method.ts";
import { byMediaType } from "$http_fns/by_media_type.ts";
import { renderHTML } from "$http_render_fns/render_html.tsx";

export default byMethod({
  GET: byMediaType({
    "text/html": renderHTML(Report),
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
  using kv = await Deno.openKv();

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
