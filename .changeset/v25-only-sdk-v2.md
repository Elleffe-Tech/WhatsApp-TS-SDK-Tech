---
"@elleffe-tech/whatsapp": major
---

Upgrade exclusively to WhatsApp Graph API v25.0. Remove runtime Graph version
selection and legacy payload aliases, add strict v25 message and webhook types,
and add GA clients for Groups, Marketing Messages, business-scoped users, In-App
Signup, analytics, messaging accounts, and billing migrations. Runtime support
is now limited to Node.js 22 and newer; Bun and Deno compatibility suites have
been removed.

Contract corrections against Meta's published v25 documentation:

- The message-echoes webhook field is `smb_message_echoes`, not `standby`
  (`standby` is a Messenger Platform field and was never delivered for
  WhatsApp).
- The pricing category is `referral_conversion`, not `referral_conversation`.
- `businessScopedUsers.getParentAccount` now uses the versioned Graph host
  rather than an unversioned `api.facebook.com` path.
- Webhook-embedded errors are typed as `WhatsappWebhookError` (`code`, `title`,
  `message`, `error_data`, `href`) rather than reusing `WhatsappError`, which
  wrongly required `fbtrace_id`. `WhatsappError` regains `error_subcode`.
- `EventNotificationMessageReferral` URL fields are `string`, not `URL` - they
  arrive via `JSON.parse` and could never have been `URL` instances.
- `CreateMessagePayload.messages[].message_status` gains `paused`.
- `analytics.getTemplate` sends the documented uppercase `granularity` and a
  bracketed `metric_types` array instead of a lowercased value and a
  comma-joined list, and gains `product_type` and `use_waba_timezone`.
- `inAppSignup.createMessagingCustomerBase` and `getMessagingCustomerBases` had
  their response types transposed.
- A caller-supplied `request.timeout` is no longer overwritten by the SDK
  default.

Removed as undocumented (none of these appear in Meta's public v25 reference; if
any turn out to be genuine partner APIs they can be restored with a citation):

- `category`, `ttl_seconds`, `direct_send_config` and `messaging_account_id` on
  the messages body, and the "Direct Send" README example built on them.
- The `voice_call` and `request_contact_info` interactive types - use the
  documented `call_permission_request` instead.
- `pin`/`unpin` messages and `MessageType.Pin`.
- `analytics.getTemplateGroup` and `analytics.getGroup`.
- `template.archive` and `template.unarchive`.
- The `account_offboarded` and `account_reconnected` webhook fields.
- The `apiBaseUrl` client option and `Client.DEFAULT_API_BASE_URL`. Every
  endpoint now goes through the single versioned Graph transport.

Added:

- The `call_permission_request` and `catalog_message` interactive types.
- The `automatic_events`, `business_capability_update`, `history` and
  `smb_app_state_sync` webhook fields.
- Missing analytics filters: `phone_numbers`/`country_codes`/`product_types` on
  messaging analytics, and `metric_types`/`conversation_types`/
  `conversation_directions` on conversation analytics. Granularity is now typed
  per analytics field, matching the per-field values Meta documents.
- `subscribedApps.deleteSubscription`.
- Cursor pagination parameters on `groups.listJoinRequests` and
  `businessScopedUsers.listBlockedUsers`.
- `join_approval_mode` on `groups.update`, which now also sends a default
  profile-picture filename instead of letting FormData name the part `blob`.
- `IncomingRequest`, `DownloadOptions` and `ClientOptions` are exported from the
  package entry point.

Other changes:

- Inbound webhook unions (`ConversationType`, status `status`, `pricing.type`,
  `pricing_model`, system-message `type`, `unsupported.type`) accept unknown
  strings again. Meta adds enum values without a Graph version bump, so closing
  these turns a routine upstream addition into a consumer compile error.
  Outgoing request types remain strict.
- Malformed webhook JSON now throws `MalformedBodyWebhookError` instead of a raw
  `SyntaxError`, `WebhookError` subclasses report their own `name`, and
  `verifySignature` works when destructured off the returned object.
- `ListPhoneNumbersPaylod` is spelled `ListPhoneNumbersPayload`.
