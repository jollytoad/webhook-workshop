
async function createOAuthApplication(gitLabUrl: string | URL = "https://gitlab.com") {
  const url = new URL("/api/v4/applications", gitLabUrl);

  // Get the GitLab API access token and prepare common request headers
  const bearerToken = Deno.env.get("GITLAB_API_TOKEN");
  const headers = {
    ...(bearerToken ? { "Authorization": `Bearer ${bearerToken}` } : {}),
    "Accept": "application/json"
  };
  
  const response = await fetch(url, {
    headers
  });

  console.log(await response.text());
}

if (import.meta.main) {
  await createOAuthApplication();
}
