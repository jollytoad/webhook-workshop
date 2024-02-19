import { ok } from "$http_fns/response/ok.ts";
import { badGateway } from "$http_fns/response/bad_gateway.ts";
import { byWebhookEvent } from "../../lib/by_webhook_event.ts";
import OpenAI from "openai/mod.ts";
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
    } else {
      // Create a new issue for the failure if one doesn't already exist
      console.log("Create new failure issue...");
      failureIssue = await createFailureIssue();
    }

    console.log(failureIssue);

    const issueIid = failureIssue.iid;

    let openai: OpenAI | undefined = undefined;

    try {
      openai = new OpenAI();
    } catch (error: unknown) {
      console.warn(error);
    }

    await Promise.allSettled(
      eventData.builds
        .filter((job) => job.status === "failed")
        .map(async (job) => {
          const jobId = job.id;
          const log = await getJobLog(jobId);

          if (log) {
            const summary = await summarizeLog(log);

            const comment = `Failed job: ${job.name}\n\n${summary}`;

            console.log(`\n${comment}`);

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
              "Give a succinct reason for the failure, and suggest a remedy. " +
              "Suggest a remedy, but only if you are confident about it, do not make one for the sake of it.",
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
