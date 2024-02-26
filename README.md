# Webhook Workshop

This is an example of building [GitLab] [webhook] handlers using [Gitpod] and
[Deno], and deploying them to Deno [Deploy].

[GitLab]: https://gitlab.com
[webhook]: https://docs.gitlab.com/ee/user/project/integrations/webhooks.html
[Gitpod]: https://gitpod.io
[Deno]: https://deno.com
[Deploy]: https://deno.com/deploy

## What can you do with it?

You can quickly build, test and deploy webhooks for [GitLab] (either gitlab.com
or your own hosted instance).

[GitPod] can provide an environment to edit the code and run a development
server with a public URL, giving a realtime.

[Deno] provides a modern Typescript runtime that avoids the large initial
download of packages, and incorporates all the tooling (ie. formatting, linting,
type checking, task running, testing) you need.

Deno [Deploy] provides a cloud edge hosting solution with a very simple
deployment mechanism, and support for a transactional distributed key-value
store, queueing, and scheduling out of the box, without having to provision
additional services.

[GitLab] itself provides the git repo hosting for your webhook codebase, and
CI/CD to test and deploy them to Deno Deploy.

The intention is that you should fork this project, and use it as a template
from which to create your own webhooks. It contains a number of example
webhooks, including a hook to create an issue on a pipeline failure and use an
OpenAI LLM to summarise the reason and suggest a remedy. The full list is
presented further down.

### Flexibility

The only hard requirement of this project is the Deno runtime, although the
overall workflow demonstrated here could be adapted to an alternative runtime or
even language.

Gitpod provides a convenience for an instant dev environment, and hosting a dev
server that is publicly accessible, but you could, if you prefer, just checkout
the code locally, install Deno, and use a HTTP tunnel.

Deno Deploy provides a convenient platform for hosting your production server,
but again, you are not locked into this. You could bundle into a Docker
container or even compile to a single binary executable. You would have to deal
with provisioning of database, and queueing if you required that though.

Although this project focuses on GitLab webhooks, but you could handle webhooks
from other services too, even in the same server.

And, as this is really just a web server, you could use it as a template to
build other things that aren't even webhooks. A web app or site, an API, or
schedule tasks (using [Deno Cron](https://docs.deno.com/deploy/kv/manual/cron)).

## Pre-requisties

You'll need accounts on:

- [GitLab]
- [Gitpod]
- Deno [Deploy]
- OpenAI - if you wish to use the `create-issue-on-fail` hook

## How to get started

1. **Fork** this repository in GitLab.
2. Click **Edit in Gitpod**. If it's your first time using Gitpod you'll have to
   go through a short onboarding process.
3. Select your preferred IDE (VSCode in browser, if you aren't sure), you'll
   only need a small instance.
4. Wait for your workspace to be created, this may take a minute or two, but it
   should re-open instantly at a later date.
5. Check your local dev server is running and publicly available, the IDE will
   prompt you to open the site in a browser.
6. Copy the long cryptic URL it took you too, this will be the base URL of your
   webhooks whilst testing.
7. Create a `.env` file from the `.env.example` and populate with appropriate
   tokens.
8. Restart the server (hit `ctrl+c` in the terminal, and run `deno task start`),
   most code changes will be picked up automatically, but you may need to do
   this again for certain things.

You are now ready to start the development and testing cycle of a webhook
against your development server running in Gitpod.

## Quick introduction to the architecture

This project is a simple web-server, using a filesystem based convention to
organise routing. All HTTP routes can be found in individual files under
[`app/routes`](./app/routes/), and all webhooks can specifically be found there
under [`hook`](./app/routes/hook/).

So the URL https://something-cryptic.gitpod.io/hook/log will invoke the handler
at [`app/routes/hook/log.ts`](./app/routes/hook/log.ts).

The main entry point of the server is [`app/main.ts`](./app/main.ts) for
production, and [`scripts/dev.ts`](./scripts/dev.ts) for development, you can
follow everything the server does from these entry points, but for the sake of
getting started your main focus will be on the modules under
[`app/routes/hook`](./app/routes/hook/).

## Testing and working on a webhook

For this example we'll focus on the [`log`](./app/routes/hook/log.ts) hook.

To add the webhook in GitLab:

1. Find or create a different project in GitLab in which you can test your
   webhooks, one that already has CI/CD pipeline is good if you want to try out
   the most complex example
   ([`create-issue-on-fail`](./app/routes/hook/create-issue-on-fail.ts)).
2. In that project go to **Settings** `>` **Webhooks**.
3. Click **Add new webhook**.
4. Paste your base gitpod **URL** (obtained earlier) and append your hook route,
   example:
   `https://8000-jollytoad-webhookworksh-259mv5t6rzu.ws-eu108.gitpod.io/hook/log`
5. If you generated and set `GITLAB_WEBHOOK_TOKEN` in your `.env`, then paste
   this value into the **Secret Token**.
6. Select the webhook events you are interested in under **Trigger**.
7. (Leave **SSL verification** enabled).
8. Finally click **Add webhook**.

You can now test your webhook via the **Test** menu, or go and perform a real
action in GitLab that triggers the appropriate event, for example, creating an
issue or running a pipeline.

Back in your Gitpod IDE, keep an eye on your terminal running the development
service and watch the logs for the hook being called.

Once you are sure the dev server is handling the webhook events, go ahead an
open [`log.ts`](./app/routes/hook/log.ts) in your IDE and make some changes,
maybe add an extra `console.log`. These should save automatically, causing the
dev server to restart making your changes immediately live.

Now try triggering the webhook again within GitLab and confirm your changes are
live from the output within the IDE terminal.

Congratulations you now have a realtime development environment running for your
webhook experiments.

If you want to create a new hook module, copying the `log.ts` is always a good
place to start.

## Deploying the webhook for production usage

This project contains a GitLab CI/CD configuration to automatically deploy your
webhooks to production on Deno Deploy on every commit.

Before you commit, it's a good idea to run `deno task check` in a terminal,
which will run the code formatter, linter and type checking for the project.

For your webhooks to be deployed to the production hosting you'll need to sign
into Deno Deploy and generate a deployment token.

1. Sign into [Deno Deploy](https://dash.deno.com/signin).
2. Visit your [Account Settings](https://dash.deno.com/account).
3. Scroll down to **Access Tokens** and hit **+ New Access Token**.
4. Give the token a good description (I like to use the GitLab URL of the
   webhooks project) and hit **Generate**.
5. Copy the newly generated token.
6. Go back to your webhooks project in GitLab, and to: **Settings** _>_
   **CI/CD** _>_ **Variables** (click **Expand**).
7. Then **Add variable**.
8. For this example, under **Flags**, check only **Mask variable**.
9. Set the **Key** field to `DENO_DEPLOY_TOKEN`, and paste the copied token into
   the **Value** field.

The pipeline should be ready to deploy now, but before you do, back your IDE,
open the file [deno.json](./deno.json) and change the value of **deploy** >
**project**. This should be a unique name within the
`https://<project>.deno.dev` domain, for example:
`https://my-webhooks.deno.dev`, so make sure your chosen project name doesn't
already exist.

You can now commit and push your changes.

The GitLab CI/CD pipeline should kick-in, check your project, and then deploy to
Deno Deploy. Watch the pipeline in GitLab, and check that the project has been
created within your [Deploy dashboard](https://dash.deno.com).

If everything went well your webhooks will be live in production at the
_deno.dev_ URL.

Now you'll need to set up some environment variables within Deploy, you only
need to do this once.

1. Visit your [Deploy dashboard](https://dash.deno.com).
2. Click on your webhooks project, and then the **Settings** tab.
3. Down to **Environment Variables** and hit **+ Add Variable**.
4. Enter keys and values for each of your variables from `.env`, clicking **+
   Add Variable** to add another.
5. Only once you've added all variables, click **Save**.
6. Now go to the **Logs** tab, where you can watch the logs of the hook
   invocations.

You production webhooks are ready to test and use from within GitLab.

1. Go back to your test project in GitLab, and **Settings** > **Webhooks**.
2. Find the test webhook you added earlier, **Edit** and replace the _gitpod_
   **URL** with the new _deno_ **URL**, for example:
   `https://my-webhooks.deno.dev/hook/log`.

Now test your webhook as you did early and monitor the logs with the Deno Deploy
project (rather than Gitpod).

You should now have live production webhooks ready to handle your GitLab events.

## Example Webhooks

This project contains several example webhooks that can provide a starting point
for your own...

### [log](./app/routes/hook/log.ts)

This simply logs information from the webhook request and event data to the
console. This is an ideal hook to copy as a starting point, as it allows you to
inspect the event payload and find the details you need, and gradually remove
the logging that you no longer need.

### [create-issue-on-fail](./app/routes/hook/create-issue-on-fail.ts)

This is a more complete example, that listens for a `pipeline`, specifically a
failure.

It demonstrates requests to the GitLab API, to a third-party API, in this case
OpenAI, and use a queueing mechanism in Deno.

It will create a new GitLab issue within the same project as the pipeline with
the label `failed-pipeline`, or use an existing open one.

Then it will fetch the logs of the failed jobs from the pipeline, and feed them
into the OpenAI GPT-4 LLM, asking for a summary of the failure and a potential
remedy. It will add this as a comment to the issue.

You'll need to set the environment variables: `GITLAB_API_TOKEN` and optionally
the `OPENAI_API_KEY` (log summary comments are skipped if not set).

The whole handler is wrapped in `background(...)` function, this is a helper
that pushes entire Request onto the
[Deno Kv Queue](https://docs.deno.com/deploy/kv/manual/queue_overview) and
immediately responds with `202 Accepted`. The queued request is then handled in
the background by the handler function passed to `background()`.

### [count](./app/routes/hook/count.ts)

This demonstrates use of the [Deno KV](https://deno.com/kv), key-value database
built into Deno, and also available within Deno Deploy.

A counter for each hook type is incremented when hit.

This is accompanied by a simple web page that reads the counts from Kv and
renders them in a table. You can open the `https://.../report/count` link of
your dev or production app to see this. See
[count.tsx](./app/routes/report/count.tsx) (NOTE: this page makes use of JSX,
but it isn't React).

### [queue](./app/routes/hook/queue.ts)

This is another, albeit simpler, demo of the queueing mechanism described above.

### [slow](./app/routes/hook/slow.ts)

Does nothing more than sleep for some amount of time, which can be given in a
parameter of the webhook URL. This can be useful to test what happens if a
webhook times out.

It also demonstrates how a search parameter can be useful as configuration for a
webhook.

## Starting the dev server

This is done automatically when using Gitpod, but in other environments you may
need to start it manually:

```sh
deno task start
```

## Adding and removing webhooks (and other routes)

Routes in the web server are represented by the filesystem structure, this needs
to be discovered by a script to generate the [routes.ts](./app/routes.ts)
module. This is done automatically when running the dev server, but sometimes
you may need to manually run the generation like so:

```sh
deno task gen
```

This may be necessary after adding or deleting a typescript module.

## Other maintenance tasks

A number of other tasks are defined in the [deno.json](./deno.json) file,
including:

- `deploy` - to manually deploy to Deno Deploy (this is used from the CI/CD
  pipeline)
- `check` - to format, lint and typescript the project
- `lock` - to delete and recreate a fresh [deno.lock](./deno.lock) file
- `token` - to generate a random token that can be used as your webhook secret
  token

## Configurations

This project contains a number of configurations that you may want to custom
along your journey:

- [.gitlab-ci.yml](./.gitlab-ci.yml) - the CI/CD pipeline for GitLab, that
  deploys to Deno Deploy.
- [.gitpod.yml](./.gitpod.yml) & [.gitpod.Dockerfile](./.gitpod.Dockerfile) -
  configuration for Gitpod.
- [deno.json](./deno.json) - configuration for the Deno runtime, and the target
  Deno Deploy project.
- [.env](./.env) - environment variables for the dev server (do not commit to
  git).
- [.env.example](./.env.example) - a template for your `.env` file.

## Resources

This project makes use of a number of Deno libraries and npm packages..

- [Deno Standard Library](https://deno.land/std)
- [HTTP Functions](https://deno.land/x/http_fns)
- [HTTP Rendering Functions](https://deno.land/x/http_fns)
- [JSX Streaming](https://deno.land/x/jsx_stream)
- [OpenAI API](https://deno.land/x/openai)
- [GitLab Event Types](https://github.com/lawvs/gitlab-event-types)
