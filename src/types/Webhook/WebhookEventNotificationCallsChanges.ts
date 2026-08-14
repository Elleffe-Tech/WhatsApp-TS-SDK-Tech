/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

import type { BSUID } from "../Account.js";
import type {
  WebhookEventNotificationContact,
  WebhookEventNotificationMetadata,
} from "./WebhookEventNotification.shared.js";

/** @experimental The outbound Calling API is not part of this SDK. */
export type WebhookEventNotificationCallsChanges = {
  field: "calls";
  value: {
    messaging_product: "whatsapp";
    metadata: WebhookEventNotificationMetadata;
    contacts?: Array<
      WebhookEventNotificationContact & {
        user_id?: BSUID;
        parent_user_id?: BSUID;
      }
    >;
    calls: Array<{
      id: string;
      event: "connect" | "terminate" | "status" | "call_created";
      timestamp: string;
      to_user_id?: BSUID;
      to_parent_user_id?: BSUID;
      recipient_user_id?: BSUID;
    }>;
  };
};
