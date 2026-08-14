import type { BSUID } from "../Account.js";
import type { PhoneNumberString } from "../PhoneNumber.js";
import type { WebhookEventNotificationMetadata } from "./WebhookEventNotification.shared.js";

/**
 * Purchase or lead events detected in conversations that began from a Click to
 * WhatsApp ad.
 *
 * The per-event payload is not fully enumerated here - only the envelope and
 * the fields common to every event are typed.
 */
export type WebhookEventNotificationAutomaticEventsChanges = {
  field: "automatic_events";
  value: {
    messaging_product: "whatsapp";
    metadata: WebhookEventNotificationMetadata;
    automatic_events?: Array<{
      type: string;
      timestamp: string;
      from?: PhoneNumberString;
      from_user_id?: BSUID;
      past_conversion_window?: boolean;
    }>;
  };
};
