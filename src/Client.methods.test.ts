import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CapturedRequest } from "./test/requestCapture.js";
import { createClient, createRequestCapture } from "./test/requestCapture.js";

type ExpectedRequest = {
  origin?: string;
  pathname: string;
  method: string;
  search?: Record<string, string>;
  body?: unknown;
};

function assertRequest(
  request: CapturedRequest | undefined,
  expected: ExpectedRequest,
) {
  assert.ok(
    request,
    `Missing request for ${expected.method} ${expected.pathname}`,
  );
  const url = new URL(request.url);
  assert.equal(url.origin, expected.origin ?? "https://graph.example.test");
  assert.equal(url.pathname, expected.pathname);
  assert.equal(request.method, expected.method);
  assert.deepEqual(Object.fromEntries(url.searchParams), expected.search ?? {});
  assert.deepEqual(request.body, expected.body);
}

describe("v25 public method request contracts", () => {
  it("serializes every analytics and billing migration operation", async () => {
    const { client, requests } = createClient();

    await client.analytics
      .getMessaging({
        businessAccountID: "waba/id",
        start: 1,
        end: 2,
        granularity: "DAY",
        phoneNumbers: ["123"],
        countryCodes: ["IT"],
        productTypes: [0, 2],
      })
      .json();
    await client.analytics
      .getConversation({
        businessAccountID: "waba",
        start: 1,
        end: 2,
        granularity: "MONTHLY",
        phoneNumbers: ["123"],
        metricTypes: ["COST"],
        conversationCategories: ["UTILITY"],
        conversationTypes: ["REGULAR"],
        conversationDirections: ["BUSINESS_INITIATED"],
        dimensions: ["PHONE"],
      })
      .json();
    await client.analytics
      .getTemplate({
        businessAccountID: "waba",
        start: 1,
        end: 2,
        granularity: "DAILY",
        templateIDs: ["11", "22"],
        metricTypes: ["SENT", "READ"],
        productType: "CLOUD_API",
        useWabaTimezone: true,
      })
      .json();
    await client.billingMigration
      .create({
        businessAccountID: "waba",
        currency: "EUR",
        extended_credit_id: "credit",
      })
      .json();
    await client.billingMigration.get({ migrationID: "migration/id" }).json();
    await client.billingMigration
      .resume({ migrationID: "migration/id" })
      .json();

    assertRequest(requests[0], {
      pathname: "/v25.0/waba%2Fid",
      method: "GET",
      search: {
        fields:
          'analytics.start(1).end(2).granularity(DAY).phone_numbers(["123"]).country_codes(["IT"]).product_types([0,2])',
      },
    });
    assertRequest(requests[1], {
      pathname: "/v25.0/waba",
      method: "GET",
      search: {
        fields:
          'conversation_analytics.start(1).end(2).granularity(MONTHLY).phone_numbers(["123"]).metric_types(["COST"]).conversation_categories(["UTILITY"]).conversation_types(["REGULAR"]).conversation_directions(["BUSINESS_INITIATED"]).dimensions(["PHONE"])',
      },
    });
    // `template_analytics` is the one analytics edge rather than a field
    // expansion, and Meta documents uppercase granularity and a bracketed
    // metric_types array.
    assertRequest(requests[2], {
      pathname: "/v25.0/waba/template_analytics",
      method: "GET",
      search: {
        start: "1",
        end: "2",
        granularity: "DAILY",
        template_ids: '["11","22"]',
        metric_types: '["SENT","READ"]',
        product_type: "CLOUD_API",
        use_waba_timezone: "true",
      },
    });
    assertRequest(requests[3], {
      pathname: "/v25.0/waba/set_payment_method_migration_intent",
      method: "POST",
      body: { currency: "EUR", extended_credit_id: "credit" },
    });
    assertRequest(requests[4], {
      pathname: "/v25.0/migration%2Fid",
      method: "GET",
    });
    assertRequest(requests[5], {
      pathname: "/v25.0/migration%2Fid/resume_migration",
      method: "POST",
    });
  });

  it("serializes business profile and business-scoped user operations", async () => {
    const { client, requests } = createClient();

    await client.businessProfile
      .getBusinessProfile({
        phoneNumberID: "phone/id",
        fields: ["about", "email"],
      })
      .json();
    await client.businessProfile
      .updateBusinessProfile({
        phoneNumberID: "phone",
        about: "About us",
        websites: ["https://example.com"],
      })
      .json();
    await client.businessScopedUsers
      .getUsername({ phoneNumberID: "phone" })
      .json();
    await client.businessScopedUsers
      .listUsernameSuggestions({ phoneNumberID: "phone" })
      .json();
    await client.businessScopedUsers
      .deleteUsername({ phoneNumberID: "phone" })
      .json();
    await client.businessScopedUsers
      .deleteContactBookEntry({ phoneNumberID: "phone", bsuid: "IT.123" })
      .json();
    await client.businessScopedUsers
      .blockUsers({
        phoneNumberID: "phone",
        users: [{ user: "39333" }, { user_id: "IT.123" }],
      })
      .json();
    await client.businessScopedUsers
      .unblockUsers({
        phoneNumberID: "phone",
        users: [{ user: "39333", user_id: "IT.123" }],
      })
      .json();
    await client.businessScopedUsers
      .listBlockedUsers({ phoneNumberID: "phone", limit: 25 })
      .json();

    assertRequest(requests[0], {
      pathname: "/v25.0/phone%2Fid/whatsapp_business_profile",
      method: "GET",
      search: { fields: "about,email" },
    });
    assertRequest(requests[1], {
      pathname: "/v25.0/phone/whatsapp_business_profile",
      method: "POST",
      body: {
        messaging_product: "whatsapp",
        about: "About us",
        websites: ["https://example.com"],
      },
    });
    assertRequest(requests[2], {
      pathname: "/v25.0/phone/username",
      method: "GET",
    });
    assertRequest(requests[3], {
      pathname: "/v25.0/phone/username_suggestions",
      method: "GET",
    });
    assertRequest(requests[4], {
      pathname: "/v25.0/phone/username",
      method: "DELETE",
    });
    assertRequest(requests[5], {
      pathname: "/v25.0/phone/contact_book",
      method: "DELETE",
      search: { messaging_product: "whatsapp", bsuid: "IT.123" },
    });
    assertRequest(requests[6], {
      pathname: "/v25.0/phone/block_users",
      method: "POST",
      body: {
        messaging_product: "whatsapp",
        block_users: [{ user: "39333" }, { user_id: "IT.123" }],
      },
    });
    assertRequest(requests[7], {
      pathname: "/v25.0/phone/block_users",
      method: "DELETE",
      body: {
        messaging_product: "whatsapp",
        block_users: [{ user: "39333", user_id: "IT.123" }],
      },
    });
    assertRequest(requests[8], {
      pathname: "/v25.0/phone/block_users",
      method: "GET",
      search: { limit: "25" },
    });
  });

  it("serializes every Groups API operation including multipart updates", async () => {
    const { client, requests } = createClient();

    await client.groups
      .get({ groupID: "group/id", fields: ["subject", "participants"] })
      .json();
    await client.groups
      .list({
        phoneNumberID: "phone",
        limit: 10,
        before: "before",
        after: "after",
      })
      .json();
    await client.groups
      .update({
        groupID: "group",
        subject: "New",
        description: "Description",
        join_approval_mode: "auto_approve",
      })
      .json();
    await client.groups
      .update({
        groupID: "group",
        subject: "Photo",
        // No explicit filename: the SDK must still name the part, since
        // FormData would otherwise call it "blob" and Meta rejects it.
        profilePicture: new Blob(["abc"], { type: "image/jpeg" }),
      })
      .json();
    await client.groups.delete({ groupID: "group" }).json();
    await client.groups.getInviteLink({ groupID: "group" }).json();
    await client.groups.resetInviteLink({ groupID: "group" }).json();
    await client.groups
      .listJoinRequests({ groupID: "group", limit: 5, after: "cursor" })
      .json();
    await client.groups
      .approveJoinRequests({ groupID: "group", joinRequests: ["one", "two"] })
      .json();
    await client.groups
      .rejectJoinRequests({ groupID: "group", joinRequests: ["three"] })
      .json();
    await client.groups
      .removeParticipants({
        groupID: "group",
        participants: [{ user: "39333" }, { user: "IT.123" }],
      })
      .json();

    assertRequest(requests[0], {
      pathname: "/v25.0/group%2Fid",
      method: "GET",
      search: { fields: "subject,participants" },
    });
    assertRequest(requests[1], {
      pathname: "/v25.0/phone/groups",
      method: "GET",
      search: { limit: "10", before: "before", after: "after" },
    });
    assertRequest(requests[2], {
      pathname: "/v25.0/group",
      method: "POST",
      body: {
        messaging_product: "whatsapp",
        subject: "New",
        description: "Description",
        join_approval_mode: "auto_approve",
      },
    });
    assertRequest(requests[3], {
      pathname: "/v25.0/group",
      method: "POST",
      body: {
        messaging_product: "whatsapp",
        subject: "Photo",
        file: { name: "profile_picture.jpg", type: "image/jpeg", size: 3 },
      },
    });
    assertRequest(requests[4], { pathname: "/v25.0/group", method: "DELETE" });
    assertRequest(requests[5], {
      pathname: "/v25.0/group/invite_link",
      method: "GET",
    });
    assertRequest(requests[6], {
      pathname: "/v25.0/group/invite_link",
      method: "POST",
      body: { messaging_product: "whatsapp" },
    });
    assertRequest(requests[7], {
      pathname: "/v25.0/group/join_requests",
      method: "GET",
      search: { limit: "5", after: "cursor" },
    });
    assertRequest(requests[8], {
      pathname: "/v25.0/group/join_requests",
      method: "POST",
      body: { messaging_product: "whatsapp", join_requests: ["one", "two"] },
    });
    assertRequest(requests[9], {
      pathname: "/v25.0/group/join_requests",
      method: "DELETE",
      body: { messaging_product: "whatsapp", join_requests: ["three"] },
    });
    assertRequest(requests[10], {
      pathname: "/v25.0/group/participants",
      method: "DELETE",
      body: {
        messaging_product: "whatsapp",
        participants: [{ user: "39333" }, { user: "IT.123" }],
      },
    });
  });

  it("serializes every In-App Signup operation", async () => {
    const { client, requests } = createClient();
    const policy = {
      tos: "https://www.facebook.com/legal/ads-manager-marketing-messages-terms" as const,
      accepted: true as const,
    };

    await client.inAppSignup
      .create({
        businessAccountID: "waba",
        signup_message: "Sign up",
        confirmation_message: "Confirmed",
        privacy_policy_url: "https://example.com/privacy",
        policy,
      })
      .json();
    await client.inAppSignup
      .list({ businessAccountID: "waba", limit: 5, after: "cursor" })
      .json();
    await client.inAppSignup
      .update({ signupID: "signup/id", status: "DISABLED", promo_code: "SAVE" })
      .json();
    await client.inAppSignup
      .createMessagingCustomerBase({
        businessID: "business/id",
        messaging_customer_base_name: "Customers",
      })
      .json();
    await client.inAppSignup
      .getMessagingCustomerBases({ businessID: "business/id" })
      .json();
    await client.inAppSignup
      .setDefaultMessagingCustomerBase({
        businessAccountID: "waba",
        messagingCustomerBaseID: "base",
      })
      .json();
    await client.inAppSignup
      .getDefaultMessagingCustomerBase({ businessAccountID: "waba" })
      .json();

    assertRequest(requests[0], {
      pathname: "/v25.0/waba/signups",
      method: "POST",
      body: {
        signup_message: "Sign up",
        confirmation_message: "Confirmed",
        privacy_policy_url: "https://example.com/privacy",
        policy,
      },
    });
    assertRequest(requests[1], {
      pathname: "/v25.0/waba/signups",
      method: "GET",
      search: { limit: "5", after: "cursor" },
    });
    assertRequest(requests[2], {
      pathname: "/v25.0/signups/signup%2Fid",
      method: "POST",
      body: { status: "DISABLED", promo_code: "SAVE" },
    });
    assertRequest(requests[3], {
      pathname: "/v25.0/business%2Fid/messaging_customer_base",
      method: "POST",
      body: { messaging_customer_base_name: "Customers" },
    });
    assertRequest(requests[4], {
      pathname: "/v25.0/business%2Fid/messaging_customer_base",
      method: "GET",
    });
    assertRequest(requests[5], {
      pathname: "/v25.0/waba/default_messaging_customer_base",
      method: "POST",
      body: { messaging_customer_base_id: "base" },
    });
    assertRequest(requests[6], {
      pathname: "/v25.0/waba/default_messaging_customer_base",
      method: "GET",
    });
  });

  it("serializes legacy GA management modules and media operations", async () => {
    const { client, requests } = createClient();

    await client.message
      .createStatus({
        phoneNumberID: "phone",
        message_id: "wamid.1",
        status: "read",
        typing_indicator: { type: "text" },
      })
      .json();
    await client.media
      .upload({
        phoneNumberID: "phone",
        file: new Blob(["pdf"], { type: "application/pdf" }),
        filename: "file.pdf",
        mimeType: "application/pdf",
      })
      .json();
    await client.media
      .getURL({ mediaID: "media/id", phoneNumberID: "phone" })
      .json();
    await client.media
      .delete({ mediaID: "media/id", phoneNumberID: "phone" })
      .json();

    const downloadCapture = createRequestCapture("binary");
    await client.media
      .download({
        mediaURL: "https://lookaside.fbsbx.com/media/file",
        request: { fetch: downloadCapture.fetch },
      })
      .text();

    await client.phoneNumbers
      .getPhoneNumber({
        phoneNumberID: "phone/id",
        fields: [
          "display_phone_number",
          ["whatsapp_business_profile", ["about"]],
        ],
      })
      .json();
    await client.phoneNumbers
      .listPhoneNumbers({
        businessAccountID: "waba",
        sort: "id_ascending",
        filtering:
          '[{"field":"status","operator":"EQUAL","value":"CONNECTED"}]',
        fields: ["id", "status"],
      })
      .json();
    await client.phoneNumbers
      .updatePhoneNumber({
        phoneNumberID: "phone",
        new_display_name: "New Name",
      })
      .json();
    await client.phoneNumbers
      .requestOfficialBusinessAccount({ phoneNumberID: "phone" })
      .json();
    await client.subscribedApps
      .createSubscription({
        businessAccountID: "waba",
        override_callback_uri: "https://example.com/webhook",
        verify_token: "token",
      })
      .json();
    await client.subscribedApps
      .listSubscriptions({ businessAccountID: "waba" })
      .json();
    await client.subscribedApps
      .deleteSubscription({ businessAccountID: "waba" })
      .json();

    assertRequest(requests[0], {
      pathname: "/v25.0/phone/messages",
      method: "POST",
      body: {
        messaging_product: "whatsapp",
        message_id: "wamid.1",
        status: "read",
        typing_indicator: { type: "text" },
      },
    });
    assertRequest(requests[1], {
      pathname: "/v25.0/phone/media",
      method: "POST",
      body: {
        messaging_product: "whatsapp",
        file: { name: "file.pdf", type: "application/pdf", size: 3 },
        type: "application/pdf",
      },
    });
    assertRequest(requests[2], {
      pathname: "/v25.0/media%2Fid",
      method: "GET",
      search: { phone_number_id: "phone" },
    });
    assertRequest(requests[3], {
      pathname: "/v25.0/media%2Fid",
      method: "DELETE",
      search: { phone_number_id: "phone" },
    });
    assertRequest(downloadCapture.requests[0], {
      origin: "https://lookaside.fbsbx.com",
      pathname: "/media/file",
      method: "GET",
    });
    assertRequest(requests[4], {
      pathname: "/v25.0/phone%2Fid",
      method: "GET",
      search: {
        fields: "display_phone_number,whatsapp_business_profile{about}",
      },
    });
    assertRequest(requests[5], {
      pathname: "/v25.0/waba/phone_numbers",
      method: "GET",
      search: {
        fields: "id,status",
        sort: "id_ascending",
        filtering:
          '[{"field":"status","operator":"EQUAL","value":"CONNECTED"}]',
      },
    });
    assertRequest(requests[6], {
      pathname: "/v25.0/phone",
      method: "POST",
      search: { new_display_name: "New Name" },
    });
    assertRequest(requests[7], {
      pathname: "/v25.0/phone/request_official_business_account",
      method: "POST",
    });
    assertRequest(requests[8], {
      pathname: "/v25.0/waba/subscribed_apps",
      method: "POST",
      body: {
        override_callback_uri: "https://example.com/webhook",
        verify_token: "token",
      },
    });
    assertRequest(requests[9], {
      pathname: "/v25.0/waba/subscribed_apps",
      method: "GET",
    });
    assertRequest(requests[10], {
      pathname: "/v25.0/waba/subscribed_apps",
      method: "DELETE",
    });
  });

  it("serializes every template and WABA operation", async () => {
    const { client, requests } = createClient();

    await client.template
      .get("template/id", { fields: ["name", "status"] })
      .json();
    await client.template
      .list("waba", {
        category: ["UTILITY", "MARKETING"],
        language: "en_US",
        limit: 10,
        fields: ["name", "degrees_of_freedom_spec"],
      })
      .json();
    await client.template
      .listLibrary({
        search: "welcome",
        category: "UTILITY",
        topic: "ORDER_MANAGEMENT",
        limit: 5,
      })
      .json();
    await client.template
      .create("waba", {
        name: "order_update",
        category: "UTILITY",
        language: "en_US",
        parameter_format: "POSITIONAL",
        components: [],
      })
      .json();
    await client.template.update("template/id", { category: "UTILITY" }).json();
    await client.template.delete("waba", { hsm_ids: ["one", "two"] }).json();
    await client.whatsappBusinessAccount
      .get("waba/id", { fields: ["name", "primary_funding_id"] })
      .json();
    await client.whatsappBusinessAccount
      .update("waba/id", {
        disable_marketing_messages_on_cloud_api: true,
        is_enabled_for_insights: true,
      })
      .json();

    assertRequest(requests[0], {
      pathname: "/v25.0/template%2Fid",
      method: "GET",
      search: { fields: "name,status" },
    });
    assertRequest(requests[1], {
      pathname: "/v25.0/waba/message_templates",
      method: "GET",
      search: {
        category: '["UTILITY","MARKETING"]',
        limit: "10",
        fields: "name,degrees_of_freedom_spec",
        language: "en_US",
      },
    });
    assertRequest(requests[2], {
      pathname: "/v25.0/message_template_library",
      method: "GET",
      search: {
        search: "welcome",
        category: "UTILITY",
        topic: "ORDER_MANAGEMENT",
        limit: "5",
      },
    });
    assertRequest(requests[3], {
      pathname: "/v25.0/waba/message_templates",
      method: "POST",
      body: {
        name: "order_update",
        category: "UTILITY",
        language: "en_US",
        parameter_format: "POSITIONAL",
        components: [],
      },
    });
    assertRequest(requests[4], {
      pathname: "/v25.0/template%2Fid",
      method: "POST",
      body: { category: "UTILITY" },
    });
    assertRequest(requests[5], {
      pathname: "/v25.0/waba/message_templates",
      method: "DELETE",
      search: { hsm_ids: '["one","two"]' },
    });
    assertRequest(requests[6], {
      pathname: "/v25.0/waba%2Fid",
      method: "GET",
      search: { fields: "name,primary_funding_id" },
    });
    assertRequest(requests[7], {
      pathname: "/v25.0/waba%2Fid",
      method: "POST",
      body: {
        disable_marketing_messages_on_cloud_api: true,
        is_enabled_for_insights: true,
      },
    });
  });
});
