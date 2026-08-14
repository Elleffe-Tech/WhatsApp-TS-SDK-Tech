import type { BSUID } from "../Account.js";
import type { MessageID } from "../Message/index.js";
import type { PhoneNumberString } from "../PhoneNumber.js";
import type { WebhookEventNotificationMetadata } from "./WebhookEventNotification.shared.js";

/**
 * Message types that can appear in a message echo. In addition to the regular
 * outgoing message types, echoes report `revoke` (message deleted) and `edit`
 * (message edited).
 */
export type SmbMessageEchoType =
  | "text"
  | "image"
  | "video"
  | "document"
  | "audio"
  | "sticker"
  | "revoke"
  | "edit"
  | (string & NonNullable<unknown>);

/**
 * A single echoed message.
 *
 * The message contents live on a property named after `type` (for example a
 * `type: "text"` echo carries a `text` property). Those payloads mirror the
 * outgoing message types and are not enumerated here.
 */
export type SmbMessageEcho = {
  id: MessageID;

  timestamp: string;

  type: SmbMessageEchoType;

  /** The business' display phone number that sent the message. */
  from?: PhoneNumberString;

  /** The WhatsApp user the message was sent to. */
  to?: PhoneNumberString;

  from_user_id?: BSUID;

  recipient_user_id?: BSUID;
};

/**
 * Describes any new messages the business customer sends with the WhatsApp
 * Business app after having been onboarded.
 */
export type WebhookEventNotificationSmbMessageEchoesChanges = {
  field: "smb_message_echoes";
  value: {
    messaging_product: "whatsapp";
    metadata: WebhookEventNotificationMetadata;
    message_echoes?: SmbMessageEcho[];
  };
};
