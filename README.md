# Webhooks Experiment

This is an example of building [GitLab] [webhooks] handlers using [Gitpod] and
[Deno], and deploying them to Deno [Deploy].

[GitLab]: https://gitlab.com
[webhooks]: https://docs.gitlab.com/ee/user/project/integrations/webhooks.html
[Gitpod]: https://gitpod.io
[Deno]: https://deno.com
[Deploy]: https://deno.com/deploy

(NOTE: requires Deno 1.40.5+)

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

## Pre-requisties

You'll need accounts on:

- [GitLab]
- [Gitpod]
- Deno [Deploy]
- OpenAI - if you wish to use the `create-issue-on-fail` hook

## How to get started

1. Fork this repository in GitLab.
2. Click `Edit in Gitpod`.
3. Select your preferred IDE (VSCode in browser, if you aren't sure), you'll
   only need a small instance.
4. Wait for your workspace to be created, this may take a minute or two, but it
   should re-open instantly at a later date.
5. Check your local dev server is running and publically available, the IDE will
   prompt you to open the site in a browser.
6. Copy the long cryptic URL it took you too, this will be the base URL of your
   webhooks whilst testing.
7. Create a `.env` file from the `.env.example` and populate with appropriate
   tokens.
8. Restart the server (hit `ctrl+c` in the terminal, and run `deno task start`),
   most code changes will be picked up automatically, but you may need to do
   this again for certain things.

## Testing and working on a webhook

_TODO_

## Deploying the webhook for production usage

_TODO_
