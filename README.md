# WhatsApp Business Platform API SDK for Node.js

[![npm (scoped)][]][sdk-npmjs]

The unofficial SDK for Meta's WhatsApp Business Messaging APIs - Cloud API.
Originally a fork of the
[deprecated official SDK for Meta's WhatsApp Business Messaging APIs](https://github.com/WhatsApp/WhatsApp-Nodejs-SDK),
later maintained by Great Detail as
[`@great-detail/whatsapp`](https://github.com/great-detail/WhatsApp-JS-SDK),
this is Elleffe Tech's fork of that SDK. Supports webhooks, phone number
management, whatsapp business account management, template management,
messaging, webhook subscription management.

If you find a bug or have a feature request, please
[open an issue](https://github.com/Elleffe-Tech/WhatsApp-TS-SDK-Tech/issues).
[Contributions](#contributing) are **greatly** appreciated too!

See this SDK's
[Changelog](https://github.com/Elleffe-Tech/WhatsApp-TS-SDK-Tech/blob/main/CHANGELOG.md)
for updates and release notes.

## Installation

Install the WhatsApp Business Platform SDK:

```bash
# NPM:
npm install @elleffe-tech/whatsapp
# or use pnpm or Yarn
```

## Getting started

The primary source of documentation for this SDK is via the TypeScript type
definitions and JSDoc comments included in the package. The types should get you
most of the way. Also see the [examples and snippets section](#usage) to get
started using the SDK.

```ts
import Client from "@elleffe-tech/whatsapp";

// Instantiate the SDK Client
const sdk = new Client({
  request: {
    headers: { Authorization: "Bearer ..." },
  },
});

// Use it!
const message = await sdk.message.createMessage({
  phoneNumberID: "123...809",
  recipientType: "individual",
  to: "1234567890",
  type: "text",
  text: { body: "Hello" },
});
```

## Compatibility

This SDK targets Meta's WhatsApp Business Platform Cloud API exclusively.

| SDK  | Cloud API |
| :--- | --------: |
| v2.x |     v25.0 |

The Graph API version is fixed by the SDK. v2 always sends versioned requests
through `/v25.0`; it has no `graphVersion` option and does not support older
request or webhook contracts. Upgrade the SDK when support for a newer Graph API
release is published.

See this SDK's
[Changelog](https://github.com/Elleffe-Tech/WhatsApp-TS-SDK-Tech/blob/main/CHANGELOG.md)
for updates and release notes.

- **Module format**: ESM only.
- **Supported Node.js versions**: `v22` and newer.
- **Tested Node.js LTS versions**: `v22` and `v24`.

Bun, Deno, and browser runtimes are not supported or tested.

## Migrating v1 to v2

v2 is a breaking, v25-only release:

- Remove `graphVersion` and `prefixUrl` from `Client` options. `baseUrl` remains
  available for proxies and testing, but the SDK always appends `/v25.0`.
- Pass `recipientType` explicitly to `message.createMessage`. Individual
  messages require `to`, `recipient` (a BSUID), or both; group messages require
  a group ID in `to`.
- Handle the status webhook's `conversation` property as optional. It is only
  sent for messages in a free entry point conversation.
- Errors embedded in webhook payloads are now typed as `WhatsappWebhookError`;
  `WhatsappError` remains the shape returned in HTTP responses.
- Handle BSUID changes as `messages` system events. The incorrectly documented
  `user_id_update` subscription type has been removed.
- Remove On-Premises-only and pre-v25 compatibility fields.

See Meta's
[WhatsApp Business Platform changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
for the upstream changes represented by these contracts.

## Usage

See the following usage examples for usage. Included in the source code and
editor integrations, TypeScript type definitions and JSDoc comments may provide
additional context and information.

### Messaging

**Create a Status Message**:

```ts
const message = await sdk.message.createStatus({
  phoneNumberID: "123...809",
  message_id: "...",
  status: "read",
  typing_indicator: { type: "text" },
});
```

**Create a Text Message**:

```ts
const message = await sdk.message.createMessage({
  phoneNumberID: "123...809",
  recipientType: "individual",
  to: "1234567890",
  type: "text",
  text: { body: "Hello" },
});
```

**Create a Template Message**:

```ts
const message = await sdk.message.createMessage({
  phoneNumberID: "123...809",
  recipientType: "individual",
  to: "1234567890",
  type: "template",
  template: {
    name: "test_1",
    language: { code: "en_US" },
    components: [
      {
        type: "body",
        parameters: [
          // Add some parameters:
          { type: "text", text: "Example" },
          {
            type: "currency",
            currency: {
              fallback_value: "£100",
              code: "GBP",
              amount_1000: 100_000,
            },
          },
          {
            type: "date_time",
            date_time: {
              fallback_value: "2026-01-01",
            },
          },
        ],
      },
    ],
  },
});
```

**Create an Interactive Message**:

Thanks @lcneves!

```ts
const message = await sdk.message.createMessage({
  phoneNumberID: "123...809",
  recipientType: "individual",
  to: "1234567890",
  type: MessageType.Interactive,
  interactive: {
    type: "button",
    body: {
      text: "Hello",
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: "button1",
            title: "Button 1",
          },
        },
        {
          type: "reply",
          reply: {
            id: "button2",
            title: "Button 2",
          },
        },
      ],
    },
  },
});
```

```ts
const message = await sdk.message.createMessage({
  phoneNumberID: "123...809",
  recipientType: "individual",
  to: "1234567890",
  type: MessageType.Interactive,
  interactive: {
    type: "cta_url",
    body: {
      text: "Hello",
    },
    action: {
      name: "cta_url",
      parameters: {
        display_text: "Open Link",
        url: "https://example.com",
      },
    },
  },
});
```

```ts
const message = await sdk.message.createMessage({
  phoneNumberID: "123...809",
  recipientType: "individual",
  to: "1234567890",
  type: MessageType.Interactive,
  interactive: {
    type: "list",
    body: {
      text: "Hello",
    },
    action: {
      button: "View Options",
      sections: [
        {
          title: "Section 1",
          rows: [
            {
              id: "option1",
              title: "Option 1",
              description: "This is option 1",
            },
            {
              id: "option2",
              title: "Option 2",
              description: "This is option 2",
            },
          ],
        },
        {
          title: "Section 2",
          rows: [
            {
              id: "option3",
              title: "Option 3",
              description: "This is option 3",
            },
            {
              id: "option4",
              title: "Option 4",
              description: "This is option 4",
            },
          ],
        },
      ],
    },
  },
});
```

**Send a marketing template**:

```ts
await sdk.marketingMessages.send({
  phoneNumberID: "123...809",
  recipientType: "individual",
  to: "1234567890",
  type: "template",
  productPolicy: "STRICT",
  template: {
    name: "summer_sale",
    language: { code: "en_US" },
    components: [],
  },
});
```

### Groups

```ts
const group = await sdk.groups.create({
  phoneNumberID: "123...809",
  subject: "Customer advisory group",
  join_approval_mode: "approval_required",
});

await sdk.message.createMessage({
  phoneNumberID: "123...809",
  recipientType: "group",
  to: "<GROUP_ID>",
  type: "text",
  text: { body: "Welcome to the group." },
});
```

### Business-scoped users

```ts
await sdk.businessScopedUsers.setUsername({
  phoneNumberID: "123...809",
  username: "example_business",
});

const blockedUsers = await sdk.businessScopedUsers.listBlockedUsers({
  phoneNumberID: "123...809",
});
```

### In-App Signup and analytics

```ts
await sdk.inAppSignup.create({
  businessAccountID: "<WABA_ID>",
  signup_message: "Get product updates on WhatsApp.",
  confirmation_message: "Thanks for signing up.",
  privacy_policy_url: "https://example.com/privacy",
  policy: {
    tos: "https://www.facebook.com/legal/ads-manager-marketing-messages-terms",
    accepted: true,
  },
});

const pricing = await sdk.analytics.getPricing({
  businessAccountID: "<WABA_ID>",
  start: 1_786_060_800,
  end: 1_788_739_200,
  granularity: "DAILY",
  countryCodes: ["IT"],
});
```

**Upload Media Files**:

```ts
import fs from "fs";
const fileBuffer = fs.readFileSync("<FILE_PATH>");
const result = await sdk.media.upload({
  phoneNumberID: "123...809",
  mimeType: "<MIME_TYPE>",
  file: fileBuffer,
});
```

**Get a Media File's Download URL**:

```ts
const result = await sdk.media.getURL({
  phoneNumberID: "123...809",
  mediaID: "<MEDIA_ID>",
});
```

**Download Media Files**:

`media.download` talks to a pre-signed lookaside URL rather than the Graph API,
so it does not inherit the client's request options. Meta still requires an
access token, so pass one explicitly:

```ts
import fs from "fs";
const result = await sdk.media.download({
  mediaURL: "<MEDIA_URL>",
  request: { headers: { Authorization: "Bearer ..." } },
});
const file = await result.arrayBuffer();
fs.writeFileSync("<FILE_PATH>", Buffer.from(file));
```

### Webhooks

**Listen for Webhook Requests with Express**:

```ts
// Registration requests:
app.get("/path/to/webhook", async (req, res) => {
  const reg = await sdk.webhook.register({
    method: request.method,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });
  // DIY: Check the reg.verifyToken value
  if (reg.verifyToken !== "abcd") {
    return res.end(reg.reject());
  }
  return res.end(reg.accept());
});

// Event Notification requests:
app.use(express.raw()); // Important <-
app.post("/path/to/webhook", async (req, res) => {
  const event = sdk.webhook.eventNotification({
    method: request.method,
    query: req.query,
    body: req.body.toString(),
    headers: req.headers,
  });
  // DIY: Load the Meta App Secret
  event.verifySignature("abcd-app-secret");
  // Non-200 status codes will be retried
  // You may want to use the dreaded "successful error"
  if (someFailedCondition) {
    res.status(400);
    return res.end();
  }
  return res.end(event.accept());
});
```

**Listen for Webhook Requests with Fastify**:

```ts
// Registration requests:
fastify.route({
  method: "GET",
  url: "/path/to/webhook",
  handler: async (request, reply) => {
    const reg = await sdk.webhook.register({
      method: request.method,
      query: request.query,
      body: undefined,
      headers: request.headers,
    });
    // DIY: Check the reg.verifyToken value
    if (reg.verifyToken !== "abcd") {
      return reply.send(reg.reject());
    }
    return reply.send(reg.accept());
  },
});

// Event Notification requests:
// See: https://github.com/fastify/fastify/issues/707#issuecomment-817224931
fastify.addContentTypeParser(
  "application/json",
  { parseAs: "buffer" },
  (_req, body, done) => {
    done(null, body);
  },
);

fastify.route({
  method: "POST",
  url: "/path/to/webhook",
  handler: (request, reply) => {
    // This SDK handles inbound webhook requests from a string for signature verification
    assert(Buffer.isBuffer(request.body) || typeof request.body === "string");
    const body = request.body.toString();

    const event = sdk.webhook.eventNotification({
      method: request.method,
      query: request.query,
      body,
      headers: request.headers,
    });
    // DIY: Load the Meta App Secret
    event.verifySignature("abcd-app-secret");
    // Non-200 status codes will be retried
    // You may want to use the dreaded "successful error"
    if (someFailedCondition) {
      return reply.code(400).send();
    }
    return reply.send(event.accept());
  },
});
```

**Listen for Webhook Requests with Oak**:

```ts
// Registration requests:
router.get("/path/to/webhook", async (context) => {
  const reg = await sdk.webhook.register({
    method: context.request.method,
    query: Object.fromEntries(context.request.url.searchParams),
    body: undefined,
    headers: Object.fromEntries(context.request.headers),
  });
  // DIY: Check the reg.verifyToken value
  if (reg.verifyToken !== "abcd") {
    context.response.body = reg.reject();
    return;
  }
  context.response.body = reg.accept();
});

// Event Notification requests:
router.post("/path/to/webhook", async (context) => {
  const body = await context.request.body({ type: "text" }).value;
  const event = sdk.webhook.eventNotification({
    method: context.request.method,
    query: Object.fromEntries(context.request.url.searchParams),
    body,
    headers: Object.fromEntries(context.request.headers),
  });
  // DIY: Load the Meta App Secret
  event.verifySignature("abcd-app-secret");
  // Non-200 status codes will be retried
  // You may want to use the dreaded "successful error"
  if (someFailedCondition) {
    context.response.status = 400;
    context.response.body = "";
    return;
  }
  context.response.body = event.accept();
});
```

### Templates

**Create a Template**:

```ts
const template = await sdk.template.create(
  "123...809", // WABA ID
  {
    parameter_format: "NAMED",
    components: [
      {
        type: "BODY",
        text: "Hello, {{name}}!",
        example: {
          body_text_named_params: [
            {
              param_name: "name",
              example: "John",
            },
          ],
        },
      },
    ],
  },
);
```

## Request Options

Under the hood, this SDK uses [ky](https://github.com/sindresorhus/ky) as a
fetch wrapper. This means that all of the quality-of-life features provided by
ky can be available to this SDK, including: retries, hooks, auto-throwing on
HTTP errors, etc. A number of these features are used under-the-hood already,
e.g. auto-throwing on HTTP errors.

**Request Retries**:

- Default retries: 3

```ts
const sdk = new Client({
  request: {
    // ...
    retry: 5, // E.g. 5 retries (6 requests total)
  },
});

// or at a method level
const message = await sdk.message.createMessage({
  phoneNumberID: "123...809",
  recipientType: "individual",
  to: "1234567890",
  type: "text",
  text: { body: "Hello" },
  request: {
    // ...
    retry: 5, // E.g. 5 retries (6 requests total)
  },
});
```

## Contributing

Contributions are **greatly** appreciated - especially surrounding API updates
and type correction! To get started:

1. **Fork** the repository and create your branch from `main`.
2. **Write clear, well-documented code** and include tests where possible.
3. **Open a pull request** describing your changes and referencing any related
   issues.

Please review our
[Code of Conduct](https://github.com/great-detail/WhatsApp-JS-SDK/blob/main/CODE_OF_CONDUCT.md)
before submitting.

If you find a bug or have a feature request, please
[open an issue](https://github.com/Elleffe-Tech/WhatsApp-TS-SDK-Tech/issues).

## License

[MIT © Great Detail Ltd](https://github.com/Elleffe-Tech/WhatsApp-TS-SDK-Tech/blob/main/LICENSE)

Originally forked from the official WhatsApp SDK created by Rashed Talukder.

### Contact

This SDK was originally forked from the
[deprecated official SDK](https://github.com/WhatsApp/WhatsApp-Nodejs-SDK), was
then maintained by
[Great Detail](https://github.com/great-detail/WhatsApp-JS-SDK) as
`@great-detail/whatsapp`, and is now maintained by Elleffe Tech as
`@elleffe-tech/whatsapp`.

**Elleffe Tech**: https://github.com/Elleffe-Tech

## TODO

The v2 surface follows generally available Graph API v25 capabilities. Alpha,
gated, limited-rollout, and public-beta APIs are intentionally excluded.

- [x] Interactive Message Types,
- [x] Template Message Types,
- [x] Template Management,
- [x] Button Message Types,
- [ ] Flow Message Types,
- [x] List Message Types,
- [x] WABA Webhook Subscription Management,
- [ ] WABA Extended Credit Management,
- [x] WABA Phone Number Management,
- [x] Groups API,
- [x] Marketing Messages API,
- [x] Business-scoped User IDs and usernames,
- [x] In-App Signup API,
- [x] WABA analytics and billing migration,
- [ ] WABA System User Management?
- [ ] Flows API,
- [ ] Calling API.

Deliberately not shipped: parameters and endpoints that are not present in
Meta's public v25 reference. If you rely on one and can point at documentation
for it, please open an issue.

[npm (scoped)]: https://img.shields.io/npm/v/%40elleffe-tech/whatsapp
[sdk-npmjs]: https://www.npmjs.com/package/@elleffe-tech/whatsapp
