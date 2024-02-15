terraform {
  required_providers {
    deno = {
      source = "denoland/deno"
    }
  }
}

provider "deno" {
}

resource "deno_project" "webhooks_project" {
  name = "webhooks-experiment-tf"
}

data "deno_assets" "webhooks_assets" {
  path    = "../"
  pattern = "app/**/*.{ts,tsx}"
}

resource "deno_deployment" "webhooks_deployment" {
  project_id      = deno_project.webhooks_project.id
  entry_point_url = "app/main.ts"
  assets          = data.deno_assets.webhooks_assets.output
  env_vars = {
    GITLAB_WEBHOOKS_TOKEN = "glwht-Dg9ZsGmvDmWme8oV42K38pQwBsv22P3nLWnkUg3zVyAg"
  }
}
