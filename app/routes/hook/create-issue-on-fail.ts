import { ok } from "@http/response/ok";
import { badGateway } from "@http/response/bad-gateway";
import { byWebhookEvent } from "../../lib/by_webhook_event.ts";
import OpenAI from "openai";
import { background } from "../../lib/background.ts";

interface Issue {
  project_id: number;
  iid: number;
}

const FAILED_LABEL = "failed-pipeline";

export default background(
  byWebhookEvent("pipeline", async (_req, eventData) => {
    // We are only interested in 'failed' pipelines
    if (eventData.object_attributes.status !== "failed") {
      return null;
    }

    // Get some useful values from the event data
    const projectId = eventData.project.id!;
    const pipelineId = eventData.object_attributes.id;
    const pipelineUrl =
      (eventData.object_attributes as unknown as { url: string }).url;
    const baseUrl = new URL("/", eventData.project.web_url);

    // Get the GitLab API access token and prepare common request headers
    const bearerToken = Deno.env.get("GITLAB_API_TOKEN");
    const headers = {
      ...(bearerToken ? { "Authorization": `Bearer ${bearerToken}` } : {}),
    };

    // Look for an existing pipeline failure issue
    let failureIssue = await getExistingFailureIssue();

    if (failureIssue) {
      console.log("Failure issue exists...");

      // At this point you could opt to return now and avoid the AI summary overhead
      // for subsequent failures if you prefer, this could even be determined from
      // a URL parameter. Or you could build a UI within this server to customize
      // your webhook behaviour and save the config using Deno.Kv to be read here.
    } else {
      // Create a new issue for the failure if one doesn't already exist
      console.log("Create new failure issue...");
      failureIssue = await createFailureIssue();
    }

    // console.log(failureIssue);

    const issueIid = failureIssue.iid;

    // Here we'll make use of an LLM to summarize jobs failures and add a comment
    // to the issue obtained above...

    let openai: OpenAI | undefined = undefined;

    try {
      openai = new OpenAI();
    } catch (error: unknown) {
      console.warn(error);
    }

    // For every failed job, summarize the failure and add a comment...

    await Promise.allSettled(
      eventData.builds
        .filter((job) => job.status === "failed")
        .map(async (job) => {
          const jobId = job.id;
          const log = await getJobLog(jobId);

          if (log) {
            const summary = await summarizeLog(log);

            const comment = `Failed job: ${job.name}\n\n${summary}`;

            // console.log(`\n${comment}`);

            await addIssueComment(comment);
          }
        }),
    );

    return ok();

    async function getExistingFailureIssue() {
      const url = new URL(`/api/v4/projects/${projectId}/issues`, baseUrl);
      url.searchParams.set("state", "opened");
      url.searchParams.set("labels", FAILED_LABEL);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const message =
          `Request to find an existing issue failed.\nStatus: ${response.status} ${response.statusText}\n`;
        console.error(message, await response.text());
        throw badGateway(message);
      }

      const issueList = await response.json() as Issue[];

      return issueList[0];
    }

    async function createFailureIssue() {
      const url = new URL(`/api/v4/projects/${projectId}/issues`, baseUrl);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Pipeline Failure",
          description:
            `Failed Pipeline: [#${pipelineId}](${pipelineUrl})\n\nJob failure summaries will be added as comments.`,
          labels: FAILED_LABEL,
        }),
      });

      if (!response.ok) {
        const message =
          `Failed to create issue for failed pipeline.\nStatus: ${response.status} ${response.statusText}\n`;
        console.error(message, await response.text());
        throw badGateway(message);
      }

      return await response.json() as Issue;
    }

    async function getJobLog(jobId: number) {
      const url = new URL(
        `/api/v4/projects/${projectId}/jobs/${jobId}/trace`,
        baseUrl,
      );

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const message =
          `Failed to get log for job.\nStatus: ${response.status} ${response.statusText}\n`;
        console.error(message, await response.text());
        throw badGateway(message);
      }

      return response.text();
    }

    async function summarizeLog(log: string) {
      const completion = await openai?.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "You will be given a detailed log of a CI job that failed. " +
              "Ignore the ANSI control sequences, convert them to markdown if quoting any of the log. " +
              "Give a succinct reason for the failure. " +
              "Suggest a remedy, based on accurate information. " +
              "If you are not certain, clearly state that you don't know, rather than providing a made-up response.",
          },
          {
            role: "user",
            content: log,
          },
        ],
      });

      return completion?.choices[0]?.message.content;
    }

    async function addIssueComment(content: string) {
      const url = new URL(
        `/api/v4/projects/${projectId}/issues/${issueIid}/notes`,
        baseUrl,
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: content,
        }),
      });

      if (!response.ok) {
        const message =
          `Failed to add comment to issue.\nStatus: ${response.status} ${response.statusText}\n`;
        console.error(message, await response.text());
      }
    }
  }),
);
