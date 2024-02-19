export let kv: Deno.Kv;

/**
 * Initialize the kv connection above.
 * This should be the first call from the main entry point of the app.
 */
export async function initKv() {
  kv ??= await Deno.openKv();
}
