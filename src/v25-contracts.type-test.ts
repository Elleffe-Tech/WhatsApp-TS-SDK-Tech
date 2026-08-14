import Client from "./Client.js";
import type {
  BusinessUsernameSuggestionsPayload,
  CreateBillingMigrationPayload,
  CreateMessageOptions,
  ConversationType,
  DefaultMessagingCustomerBasePayload,
  UpdateBlockedUsersPayload,
  WebhookEventNotificationChange,
} from "./index.js";
import { MessageType } from "./index.js";

const individualBase = {
  phoneNumberID: "phone-number-id",
  recipientType: "individual" as const,
  to: "393331234567",
};

// Every outgoing message union is represented here so type regressions fail
// `pnpm typecheck` even when the runtime serializer still happens to work.
const outgoingMessages = [
  {
    ...individualBase,
    type: MessageType.Audio,
    audio: { id: "media-id" },
  },
  {
    ...individualBase,
    type: MessageType.Contacts,
    contacts: [{ name: { formatted_name: "Ada Lovelace" } }],
  },
  {
    ...individualBase,
    type: MessageType.Document,
    document: { link: "https://example.test/file.pdf", filename: "file.pdf" },
  },
  {
    ...individualBase,
    type: MessageType.Image,
    image: { id: "image-id", caption: "A photo" },
  },
  {
    ...individualBase,
    type: MessageType.Interactive,
    interactive: {
      type: "location_request_message" as const,
      body: { text: "Share your location" },
      action: { name: "send_location" as const },
    },
  },
  {
    ...individualBase,
    type: MessageType.Interactive,
    interactive: {
      type: "call_permission_request" as const,
      body: { text: "May we call you about your order?" },
      action: { name: "call_permission_request" as const },
    },
  },
  {
    ...individualBase,
    type: MessageType.Interactive,
    interactive: {
      type: "catalog_message" as const,
      body: { text: "Browse our catalog" },
      action: {
        name: "catalog_message" as const,
        parameters: { thumbnail_product_retailer_id: "SKU-1" },
      },
    },
  },
  {
    ...individualBase,
    type: MessageType.Location,
    location: { latitude: 41.9028, longitude: 12.4964, name: "Rome" },
  },
  {
    ...individualBase,
    type: MessageType.Reaction,
    reaction: { message_id: "wamid.original", emoji: "✅" },
  },
  {
    ...individualBase,
    type: MessageType.Sticker,
    sticker: { id: "sticker-id" },
  },
  {
    ...individualBase,
    type: MessageType.Template,
    template: {
      name: "shipping_update",
      language: { code: "en_US" },
      components: [],
    },
  },
  {
    ...individualBase,
    type: MessageType.Text,
    text: { body: "Hello", preview_url: false },
  },
  {
    ...individualBase,
    type: MessageType.Video,
    video: { id: "video-id", caption: "A video" },
  },
  {
    phoneNumberID: "phone-number-id",
    recipientType: "group" as const,
    to: "group-id",
    type: MessageType.Text,
    text: { body: "Welcome to the group." },
  },
] satisfies CreateMessageOptions[];

const client = new Client();
for (const message of outgoingMessages) client.message.createMessage(message);

client.marketingMessages.send({
  phoneNumberID: "phone-number-id",
  recipientType: "individual",
  recipient: "IT.1234",
  type: "template",
  template: {
    name: "marketing",
    language: { code: "en_US" },
    components: [],
  },
});

// @ts-expect-error Graph API version selection was removed in v2.
new Client({ graphVersion: "v24.0" });

// @ts-expect-error v25 requires an explicit recipient type and recipient.
const missingRecipient: CreateMessageOptions = {
  phoneNumberID: "phone-number-id",
  type: MessageType.Text,
  text: { body: "invalid" },
};

// @ts-expect-error Individual messages must use `to` or `recipient`.
const individualWithoutAddress: CreateMessageOptions = {
  phoneNumberID: "phone-number-id",
  recipientType: "individual",
  type: MessageType.Text,
  text: { body: "invalid" },
};

// @ts-expect-error Group messages cannot use a business-scoped user recipient.
const groupWithRecipient: CreateMessageOptions = {
  phoneNumberID: "phone-number-id",
  recipientType: "group",
  to: "group-id",
  recipient: "IT.1234",
  type: MessageType.Text,
  text: { body: "invalid" },
};

client.message.createStatus({
  phoneNumberID: "phone-number-id",
  message_id: "wamid.message",
  // @ts-expect-error Outgoing status updates only accept `read` in v25.
  status: "delivered",
});

client.message.createMessage({
  ...individualBase,
  type: MessageType.Text,
  text: { body: "invalid" },
  // @ts-expect-error Direct-send parameters are not part of the documented v25
  // messages contract and were removed.
  category: "utility",
});

client.message.createMessage({
  ...individualBase,
  type: MessageType.Text,
  text: { body: "invalid" },
  // @ts-expect-error `ttl_seconds` is a template-creation setting, not a
  // per-message send parameter.
  ttl_seconds: 600,
});

client.marketingMessages.send({
  phoneNumberID: "phone-number-id",
  // @ts-expect-error Marketing Messages only support individual recipients.
  recipientType: "group",
  to: "group-id",
  type: "template",
  template: {
    name: "marketing",
    language: { code: "en_US" },
    components: [],
  },
});

const metadata = {
  display_phone_number: "393331234567",
  phone_number_id: "phone-number-id",
};

const v25WebhookChanges = [
  {
    field: "messages",
    value: {
      messaging_product: "whatsapp",
      metadata,
      messages: [
        {
          id: "wamid.system",
          timestamp: "1786700000",
          type: MessageType.System,
          system: {
            body: "User identifier changed",
            type: "user_changed_user_id",
            user_id: "IT.new",
            previous_user_id: "IT.old",
          },
        },
      ],
      statuses: [
        {
          id: "wamid.status",
          recipient_user_id: "IT.1234",
          status: "delivered",
          timestamp: "1786700000",
        },
      ],
    },
  },
  {
    field: "group_lifecycle_update",
    value: {
      messaging_product: "whatsapp",
      metadata,
      group_id: "group-id",
      timestamp: "1786700000",
      event: "CREATE",
      success: true,
      invite_link: "https://chat.whatsapp.com/example",
    },
  },
  {
    field: "group_participants_update",
    value: {
      messaging_product: "whatsapp",
      metadata,
      group_id: "group-id",
      timestamp: "1786700000",
      event: "JOIN",
      added_participants: [{ user_id: "IT.1234" }],
    },
  },
  {
    field: "group_settings_update",
    value: {
      messaging_product: "whatsapp",
      metadata,
      group_id: "group-id",
      timestamp: "1786700000",
      event: "JOIN_APPROVAL_MODE",
      join_approval_mode: "approval_required",
    },
  },
  {
    field: "group_status_update",
    value: {
      messaging_product: "whatsapp",
      metadata,
      group_id: "group-id",
      timestamp: "1786700000",
      event: "ACTIVE",
    },
  },
  {
    field: "smb_message_echoes",
    value: {
      messaging_product: "whatsapp",
      metadata,
      message_echoes: [
        {
          id: "wamid.echo",
          timestamp: "1786700000",
          recipient_user_id: "IT.1234",
          type: "text",
        },
      ],
    },
  },
  {
    field: "history",
    value: {
      messaging_product: "whatsapp",
      metadata,
      history: [{ metadata: { phase: 0, chunk_order: 1, progress: 100 } }],
    },
  },
  {
    field: "smb_app_state_sync",
    value: {
      messaging_product: "whatsapp",
      metadata,
      state_sync: [{ type: "contact", action: "add" }],
    },
  },
  {
    field: "automatic_events",
    value: {
      messaging_product: "whatsapp",
      metadata,
      automatic_events: [{ type: "purchase", timestamp: "1786700000" }],
    },
  },
  {
    field: "business_capability_update",
    value: { max_daily_conversation_per_phone: 1000 },
  },
] satisfies WebhookEventNotificationChange[];

const removedWebhook: WebhookEventNotificationChange = {
  // @ts-expect-error `user_id_update` is not a v25 subscribable webhook field.
  field: "user_id_update",
  value: {} as never,
};

const messengerStandby: WebhookEventNotificationChange = {
  // @ts-expect-error `standby` is a Messenger Platform field. WhatsApp message
  // echoes arrive as `smb_message_echoes`.
  field: "standby",
  value: {} as never,
};

// The documented pricing category is `referral_conversion`. `ConversationType`
// deliberately stays open so categories Meta adds mid-version still assign, so
// this can only be asserted positively.
const conversationCategory: ConversationType = "referral_conversion";

const migrationPayload: CreateBillingMigrationPayload = {
  migration_id: "migration-id",
  migration_status: "IN_PROGRESS",
};
const defaultCustomerBase: DefaultMessagingCustomerBasePayload = {
  default_messaging_customer_base_id: "customer-base-id",
  updated_time: "2026-08-14T10:00:00+0000",
};
const usernameSuggestions: BusinessUsernameSuggestionsPayload = {
  data: [{ username_suggestions: ["example_business"] }],
};
const blockedUsers: UpdateBlockedUsersPayload = {
  messaging_product: "whatsapp",
  block_users: { added_users: [{ input: "IT.1234", user_id: "IT.1234" }] },
};

void [
  missingRecipient,
  individualWithoutAddress,
  groupWithRecipient,
  v25WebhookChanges,
  removedWebhook,
  messengerStandby,
  conversationCategory,
  migrationPayload,
  defaultCustomerBase,
  usernameSuggestions,
  blockedUsers,
];
