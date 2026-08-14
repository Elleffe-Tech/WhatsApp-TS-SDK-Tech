import type { BSUID } from "../Account.js";
import type { WhatsappWebhookError } from "../Error.js";
import type { GroupID, GroupJoinApprovalMode } from "../Groups/index.js";
import type { PhoneNumberString } from "../PhoneNumber.js";
import type { WebhookEventNotificationMetadata } from "./WebhookEventNotification.shared.js";

type GroupWebhookValue<T> = {
  messaging_product: "whatsapp";
  metadata: WebhookEventNotificationMetadata;
  group_id: GroupID;
  timestamp: string;
  errors?: WhatsappWebhookError[];
} & T;

export type WebhookEventNotificationGroupLifecycleUpdateChanges = {
  field: "group_lifecycle_update";
  value: GroupWebhookValue<{
    event: "CREATE" | "DELETE" | "SUSPEND" | "UNSUSPEND";
    success: boolean;
    invite_link?: string;
  }>;
};

export type WebhookEventNotificationGroupParticipantsUpdateChanges = {
  field: "group_participants_update";
  value: GroupWebhookValue<{
    event: "JOIN" | "LEAVE" | "REMOVE" | "JOIN_REQUEST";
    added_participants?: Array<{
      wa_id?: PhoneNumberString;
      user_id?: BSUID;
    }>;
    removed_participants?: Array<{
      input: PhoneNumberString | BSUID;
      wa_id?: PhoneNumberString;
      user_id?: BSUID;
    }>;
  }>;
};

export type WebhookEventNotificationGroupSettingsUpdateChanges = {
  field: "group_settings_update";
  value: GroupWebhookValue<{
    event: "SUBJECT" | "DESCRIPTION" | "PROFILE_PICTURE" | "JOIN_APPROVAL_MODE";
    subject?: string;
    description?: string;
    join_approval_mode?: GroupJoinApprovalMode;
  }>;
};

export type WebhookEventNotificationGroupStatusUpdateChanges = {
  field: "group_status_update";
  value: GroupWebhookValue<{
    event: "ACTIVE" | "SUSPENDED" | "DELETED";
  }>;
};

export type WebhookEventNotificationGroupsChanges =
  | WebhookEventNotificationGroupLifecycleUpdateChanges
  | WebhookEventNotificationGroupParticipantsUpdateChanges
  | WebhookEventNotificationGroupSettingsUpdateChanges
  | WebhookEventNotificationGroupStatusUpdateChanges;
