import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Client from "./Client.js";
import { createClient } from "./test/requestCapture.js";
import { MessageType } from "./types/Message/MessageType.js";

describe("Client v25 transport", () => {
  it("always sends Graph requests through v25.0", async () => {
    const { client, requests } = createClient();

    await client.groups
      .create({
        phoneNumberID: "123",
        subject: "Support",
        join_approval_mode: "approval_required",
      })
      .json();

    assert.deepEqual(requests, [
      {
        url: "https://graph.example.test/v25.0/123/groups",
        method: "POST",
        body: {
          messaging_product: "whatsapp",
          subject: "Support",
          join_approval_mode: "approval_required",
        },
      },
    ]);
  });

  it("sends parent BSUID lookups through the versioned Graph host", async () => {
    const { client, requests } = createClient();

    await client.businessScopedUsers
      .getParentAccount({ businessID: "business" })
      .json();

    assert.equal(
      requests[0]?.url,
      "https://graph.example.test/v25.0/business/parent-bsuid-accounts",
    );
  });

  it("lets a caller override the default request timeout", async () => {
    // The SDK's 72s default must not clobber a caller-supplied timeout, so a
    // short one has to actually fire.
    const client = new Client({
      baseUrl: "https://graph.example.test/",
      request: {
        timeout: 20,
        retry: 0,
        fetch: (_input, init) =>
          new Promise((_resolve, reject) => {
            (init as RequestInit | undefined)?.signal?.addEventListener(
              "abort",
              () => reject(new Error("aborted")),
            );
          }),
      },
    });

    await assert.rejects(() =>
      client.whatsappBusinessAccount.get("waba").json(),
    );
  });

  it("serializes strict recipients and Marketing Messages fields", async () => {
    const { client, requests } = createClient();

    await client.message
      .createMessage({
        phoneNumberID: "123",
        recipientType: "individual",
        recipient: "IT.1234",
        type: MessageType.Text,
        text: { body: "Your order shipped" },
      })
      .json();

    await client.marketingMessages
      .send({
        phoneNumberID: "123",
        recipientType: "individual",
        to: "393331234567",
        type: "template",
        template: {
          name: "summer_sale",
          language: { code: "en_US" },
          components: [],
        },
        productPolicy: "STRICT",
        messageActivitySharing: false,
      })
      .json();

    assert.deepEqual(requests[0]?.body, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      recipient: "IT.1234",
      type: "text",
      text: { body: "Your order shipped" },
    });
    assert.deepEqual(requests[1]?.body, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "393331234567",
      type: "template",
      template: {
        name: "summer_sale",
        language: { code: "en_US" },
        components: [],
      },
      product_policy: "STRICT",
      message_activity_sharing: false,
    });
  });

  it("serializes analytics field expressions", async () => {
    const { client, requests } = createClient();

    await client.analytics
      .getPricing({
        businessAccountID: "waba",
        start: 1,
        end: 2,
        granularity: "DAILY",
        countryCodes: ["IT"],
        dimensions: ["COUNTRY", "PRICING_CATEGORY"],
      })
      .json();

    const url = new URL(requests[0]?.url ?? "");
    assert.equal(url.pathname, "/v25.0/waba");
    assert.equal(
      url.searchParams.get("fields"),
      'pricing_analytics.start(1).end(2).granularity(DAILY).country_codes(["IT"]).dimensions(["COUNTRY","PRICING_CATEGORY"])',
    );
  });

  it("routes the remaining GA clients through v25.0", async () => {
    const { client, requests } = createClient();

    await client.inAppSignup.get({ signupID: "signup/id" }).json();
    await client.billingMigration
      .resume({ migrationID: "migration/id" })
      .json();
    await client.messagingAccounts
      .get({ messagingAccountID: "account/id", fields: ["primary_funding_id"] })
      .json();
    await client.businessScopedUsers
      .setUsername({ phoneNumberID: "123", username: "example_business" })
      .json();

    assert.deepEqual(
      requests.map(({ url, method }) => ({ url, method })),
      [
        {
          url: "https://graph.example.test/v25.0/signups/signup%2Fid",
          method: "GET",
        },
        {
          url: "https://graph.example.test/v25.0/migration%2Fid/resume_migration",
          method: "POST",
        },
        {
          url: "https://graph.example.test/v25.0/account%2Fid?fields=primary_funding_id",
          method: "GET",
        },
        {
          url: "https://graph.example.test/v25.0/123/username",
          method: "POST",
        },
      ],
    );
  });
});
