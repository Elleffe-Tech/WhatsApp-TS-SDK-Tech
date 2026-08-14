import type { WebhookEventNotificationMetadata } from "./WebhookEventNotification.shared.js";

/**
 * Synchronises WhatsApp Business app chat history for onboarded business
 * customers.
 *
 * History is delivered in chunks; `metadata.phase` and `metadata.chunk_order`
 * describe where each notification sits in the overall sync. The per-thread
 * message payloads are not enumerated here.
 */
export type WebhookEventNotificationHistoryChanges = {
  field: "history";
  value: {
    messaging_product: "whatsapp";
    metadata: WebhookEventNotificationMetadata;
    history?: Array<{
      metadata: {
        phase?: number;
        chunk_order?: number;
        progress?: number;
      };
      threads?: Array<{ id: string }>;
    }>;
  };
};
