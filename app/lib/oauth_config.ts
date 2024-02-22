import type { OAuth2ClientConfig } from "$deno_kv_oauth/types.ts";
import { createGitLabOAuthConfig } from "$deno_kv_oauth/create_gitlab_oauth_config.ts";

export function asOAuth2ClientConfig(
  req: Request,
): OAuth2ClientConfig {
  console.log(req.headers);
  const redirectUri = new URL("/auth/callback", req.url).href;
  console.log(redirectUri);
  return createGitLabOAuthConfig({
    redirectUri,
    scope: ["openid", "api"]
  });
}
