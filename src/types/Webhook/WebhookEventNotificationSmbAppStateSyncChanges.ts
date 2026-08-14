import type { PhoneNumberString } from "../PhoneNumber.js";
import type { WebhookEventNotificationMetadata } from "./WebhookEventNotification.shared.js";

/**
 * Synchronises contacts for onboarded WhatsApp Business app users.
 */
export type WebhookEventNotificationSmbAppStateSyncChanges = {
  field: "smb_app_state_sync";
  value: {
    messaging_product: "whatsapp";
    metadata: WebhookEventNotificationMetadata;
    state_sync?: Array<{
      type: string;
      action?: string;
      contact?: {
        phone_number?: PhoneNumberString;
        full_name?: string;
        first_name?: string;
      };
    }>;
  };
};
