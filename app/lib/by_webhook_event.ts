import { byMethod } from "$http_fns/by_method.ts";
import { badRequest } from "$http_fns/response/bad_request.ts";
import type { Awaitable } from "$http_fns/types.ts";
import type {
  BuildEvent,
  DeploymentEvent,
  EmojiEvent,
  FeatureFlagEvent,
  IssueEvent,
  MergeRequestEvent,
  NoteEvent,
  PipelineEvent,
  PushEvent,
  ReleaseEvent,
  TagPushEvent,
  WebhookEvents,
  WikiPageEvent,
} from "gitlab-event-types";

interface EventCatalog {
  push: PushEvent;
  tag_push: TagPushEvent;
  issue: IssueEvent;
  note: NoteEvent;
  merge_request: MergeRequestEvent;
  wiki_page: WikiPageEvent;
  pipeline: PipelineEvent;
  build: BuildEvent;
  deployment: DeploymentEvent;
  // group_member: GroupMemberEvent
  // subgroup: SubgroupEvent
  feature_flag: FeatureFlagEvent;
  release: ReleaseEvent;
  emoji: EmojiEvent;
  "*": WebhookEvents;
}

/**
 * Create a Request handler for a GitLab Webhook Event.
 *
 * @param eventName the type of event to handle, should be an event name, or `*` to handle any event
 * @param handler the handler to call should the event type match, it should take the Request and the event data as arguments
 * @returns a Request handler that returns a Response or null
 */
export function byWebhookEvent<
  N extends keyof EventCatalog,
  A extends [],
>(
  eventName: N,
  handler: (
    req: Request,
    eventData: EventCatalog[N],
    ...args: A
  ) => Awaitable<Response | null>,
) {
  // FIXME: some X-GitLab-Event values do not match the object_kind in the event data

  const expectedEventHeaderValue = eventName === "*"
    ? undefined
    : eventName.replace("_", " ") + " hook";

  return byMethod({
    POST: async (req: Request, ...args: A) => {
      if (expectedEventHeaderValue) {
        const eventHeaderValue = req.headers.get("X-Gitlab-Event")
          ?.toLowerCase();

        if (eventHeaderValue !== expectedEventHeaderValue) {
          // X-GitLab-Event does match the expected event name, so skip handling
          return null;
        }
      }

      let eventData;

      try {
        eventData = await req.json();
      } catch {
        return badRequest("Failed to parse event data");
      }

      if (eventName !== "*" && eventData.object_kind !== eventName) {
        return badRequest(`Mismatching object_kind, expected "${eventName}"`);
      }

      return handler(req, eventData, ...args);
    },
  });
}
