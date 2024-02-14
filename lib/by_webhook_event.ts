import { byMethod } from "$http_fns/by_method.ts";
import { badRequest } from "$http_fns/response/bad_request.ts";
import { Awaitable } from "$http_fns/types.ts";
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
  WikiPageEvent,
} from "gitlab-event-types";

type NamedEvent =
  | PushEvent
  | TagPushEvent
  | IssueEvent
  | NoteEvent
  | MergeRequestEvent
  | WikiPageEvent
  | PipelineEvent
  | BuildEvent
  | DeploymentEvent
  // | GroupMemberEvent
  // | SubgroupEvent
  | FeatureFlagEvent
  | ReleaseEvent
  | EmojiEvent;

/**
 * Create a Request handler for a GitLab Webhook Event.
 *
 * @param eventName the type of event to handle, should be an event name, or `*` to handle any event
 * @param handler the handler to call should the event type match, it should take the Request and the event data as arguments
 * @returns a Request handler that returns a Response or null
 */
export function byWebhookEvent<
  E extends NamedEvent,
  N extends E["object_kind"] | "*",
  A extends [],
>(
  eventName: N,
  handler: (
    req: Request,
    eventData: E,
    ...args: A
  ) => Awaitable<Response | null>,
) {
  const expectedEventHeaderValue = eventName === "*"
    ? undefined
    : (eventName as string).replace("_", " ") + " hook";

  return byMethod({
    POST: async (req: Request, ...args: A) => {
      if (expectedEventHeaderValue) {
        const eventHeaderValue = req.headers.get("X-GitLab-Event")
          ?.toLowerCase();

        // TODO: verify token (maybe this should be done by an interceptor)

        if (eventHeaderValue !== expectedEventHeaderValue) {
          // X-GitLab-Event does match the expected event name, so skip handling
          return null;
        }
      }

      let eventData: E;

      try {
        eventData = (await req.json()) as E;
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
