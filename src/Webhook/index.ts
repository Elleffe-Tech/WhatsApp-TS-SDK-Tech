/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

import { timingSafeEqual } from "node:crypto";
import type { WebhookEventNotification } from "../types/Webhook/WebhookEventNotification.js";
import { arrayBufferToHex, strToArrayBuffer } from "../utils/buffer.js";
import IncorrectMethodWebhookError from "./WebhookError/IncorrectMethodWebhookError.js";
import WebhookError from "./WebhookError/index.js";
import InvalidHubChallengeWebhookError from "./WebhookError/InvalidHubChallengeWebhookError.js";
import InvalidHubModeWebhookError from "./WebhookError/InvalidHubModeWebhookError.js";
import InvalidHubSignatureWebhookError from "./WebhookError/InvalidHubSignatureWebhookError.js";
import InvalidHubVerifyTokenWebhookError from "./WebhookError/InvalidHubVerifyTokenWebhookError.js";
import MalformedBodyWebhookError from "./WebhookError/MalformedBodyWebhookError.js";
import MissingBodyWebhookError from "./WebhookError/MissingBodyWebhookError.js";

export interface IncomingRequest {
  method: string;
  query: Record<string, string>;
  body?: string;
  headers: Record<string, string | string[] | undefined>;
}

function getHeader(
  headers: IncomingRequest["headers"],
  requestedName: string,
): string | undefined {
  const header = Object.entries(headers).find(
    ([name]) => name.toLowerCase() === requestedName,
  )?.[1];

  return Array.isArray(header) ? header[0] : header;
}

function getHubSignature(
  headers: IncomingRequest["headers"],
  name: "x-hub-signature" | "x-hub-signature-256",
  algorithm: "sha1" | "sha256",
): string | undefined {
  const value = getHeader(headers, name);
  const prefix = `${algorithm}=`;

  if (!value?.startsWith(prefix) || value.length === prefix.length) {
    return undefined;
  }

  return value.slice(prefix.length);
}

export default class Webhook {
  public errors = {
    WebhookError,
    IncorrectMethodWebhookError,
    InvalidHubChallengeWebhookError,
    InvalidHubModeWebhookError,
    InvalidHubSignatureWebhookError,
    InvalidHubVerifyTokenWebhookError,
    MalformedBodyWebhookError,
    MissingBodyWebhookError,
  };

  /**
   * Handle a Registration Webhook Request.
   * The handler for `GET` requests to your webhook endpoint. A registration
   * request is when WhatsApp sends a GET request to your webhook endpoint to
   * verify that it is valid. The challenge should be returned if valid.
   *
   * **ExpressJS**:
   *
   * ```ts
   * app.get(
   *   "/path/to/webhook",
   *   async (req, res) => {
   *     const reg = await sdk.webhook.register({
   *       method: request.method,
   *       query: req.query,
   *       body: req.body,
   *       headers: req.headers,
   *     });
   *     // DIY: Check the reg.verifyToken value
   *     if (reg.verifyToken !== "abcd") {
   *       return res.end(reg.reject());
   *     }
   *     return res.end(reg.accept());
   *   }
   * );
   * ```
   *
   * **Fastify**:
   *
   * ```ts
   * fastify.route({
   *   method: "GET",
   *   url: "/path/to/webhook",
   *   handler: (request, reply) => {   *
   *     const reg = await sdk.webhook.register({
   *       method: request.method,
   *       query: request.query,
   *       body: undefined,
   *       headers: request.headers,
   *     });
   *     // DIY: Check the reg.verifyToken value
   *     if (reg.verifyToken !== "abcd") {
   *       return reply.send(reg.reject());
   *     }
   *     return reply.send(reg.accept());
   *   }
   * });
   * ```
   *
   * **Oak**:
   *
   * ```ts
   * router.get("/path/to/webhook", async (context) => {
   *   const reg = await sdk.webhook.register({
   *     method: context.request.method,
   *     query: Object.fromEntries(context.request.url.searchParams),
   *     body: undefined,
   *     headers: Object.fromEntries(context.request.headers),
   *   });
   *   // DIY: Check the reg.verifyToken value
   *   if (reg.verifyToken !== "abcd") {
   *     context.response.body = reg.reject();
   *     return;
   *   }
   *   context.response.body = reg.accept();
   * });
   * ```
   *
   * @throws {WebhookError}
   */
  public async register(request: IncomingRequest) {
    if (request.method.toLowerCase() !== "get") {
      throw new IncorrectMethodWebhookError(
        "Webhook Registration Requests must use the GET request method.",
      );
    }

    const hubMode = request.query["hub.mode"] ?? undefined;
    if (!hubMode || hubMode !== "subscribe") {
      throw new InvalidHubModeWebhookError(
        "Webhook Registration Request must have query parameter: hub.mode=subscribe",
      );
    }

    const hubChallenge = request.query["hub.challenge"] ?? undefined;
    if (!hubChallenge) {
      throw new InvalidHubChallengeWebhookError(
        "Webhook Registration Request must have query parameter: hub.challenge",
      );
    }

    const hubVerifyToken = request.query["hub.verify_token"] ?? undefined;
    if (!hubVerifyToken) {
      throw new InvalidHubVerifyTokenWebhookError(
        "Webhook Registration Request must have query parameter: hub.verify_token",
      );
    }

    return {
      verifyToken: hubVerifyToken,
      challenge: hubChallenge,
      accept: () => hubChallenge,
      reject: () => {},
    };
  }

  /**
   * Handle an Event Notification Webhook Request.
   * The handler for `POST` requests to your webhook endpoint.
   *
   * **ExpressJS**:
   *
   * ```ts
   * app.use(express.raw()); // Important <-
   * app.post(
   *   "/path/to/webhook",
   *   async (req, res) => {
   *     const event = sdk.webhook.eventNotification({
   *       method: request.method,
   *       query: req.query,
   *       body: req.body.toString(),
   *       headers: req.headers,
   *     });
   *     // DIY: Load the Meta App Secret
   *     event.verifySignature("abcd-app-secret");
   *     // Non-200 status codes will be retried
   *     // You may want to use the dreaded "successful error"
   *     if (someFailedCondition) {
   *       res.status(400);
   *       return res.end();
   *     }
   *     return res.end(event.accept());
   *   }
   * );
   * ```
   *
   * **Fastify**:
   *
   * ```ts
   * // See: https://github.com/fastify/fastify/issues/707#issuecomment-817224931
   * fastify.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => {
   *   done(null, body);
   * });
   *
   * fastify.route({
   *   method: "POST",
   *   url: "/path/to/webhook",
   *   handler: (request, reply) => {
   *     // This SDK handles inbound webhook requests from a string for signature verification
   *     assert(Buffer.isBuffer(request.body) || typeof request.body === "string");
   *     const body = request.body.toString();
   *
   *     const event = sdk.webhook.eventNotification({
   *       method: request.method,
   *       query: request.query,
   *       body,
   *       headers: request.headers,
   *     });
   *     // DIY: Load the Meta App Secret
   *     event.verifySignature("abcd-app-secret");
   *     // Non-200 status codes will be retried
   *     // You may want to use the dreaded "successful error"
   *     if (someFailedCondition) {
   *       return reply.code(400).send();
   *     }
   *     return reply.send(event.accept());
   *   }
   * });
   * ```
   *
   * **Oak**;
   *
   * ```ts
   * router.post("/path/to/webhook", async (context) => {
   *   const body = await context.request.body({ type: "text" }).value;
   *   const event = sdk.webhook.eventNotification({
   *     method: context.request.method,
   *     query: Object.fromEntries(context.request.url.searchParams),
   *     body,
   *     headers: Object.fromEntries(context.request.headers),
   *   });
   *   // DIY: Load the Meta App Secret
   *   event.verifySignature("abcd-app-secret");
   *   // Non-200 status codes will be retried
   *   // You may want to use the dreaded "successful error"
   *   if (someFailedCondition) {
   *     context.response.status = 400;
   *     context.response.body = "";
   *     return;
   *   }
   *   context.response.body = event.accept();
   * });
   * ```
   */
  public async eventNotification(request: IncomingRequest) {
    if (request.method.toLowerCase() !== "post") {
      throw new IncorrectMethodWebhookError(
        "Webhook Event Notification Request must use the POST request method.",
      );
    }

    const xHubSignature1 = getHubSignature(
      request.headers,
      "x-hub-signature",
      "sha1",
    );
    const xHubSignature256 = getHubSignature(
      request.headers,
      "x-hub-signature-256",
      "sha256",
    );
    if (!xHubSignature256) {
      throw new InvalidHubSignatureWebhookError(
        "Webhook Event Notification Request must have header: x-hub-signature-256",
      );
    }

    if (!request.body) {
      throw new MissingBodyWebhookError(
        "Webhook Event Notification Request must have a body",
      );
    }

    // Async request body buffering
    const bodyString = request.body;
    let eventNotification: WebhookEventNotification;
    try {
      eventNotification = JSON.parse(bodyString) as WebhookEventNotification;
    } catch (cause) {
      // The body is parsed before the caller has had a chance to verify the
      // signature, so unauthenticated garbage must surface as a WebhookError
      // rather than a raw SyntaxError.
      throw new MalformedBodyWebhookError(
        "Webhook Event Notification Request body is not valid JSON",
        { cause },
      );
    }

    // Returns a Promise<string> (hex signature)
    function getCalculatedSignature(alg: string) {
      let algorithm: string | undefined;
      switch (alg.toLowerCase()) {
        case "sha1":
        case "sha-1": {
          algorithm = "SHA-1";
          break;
        }

        case "sha256":
        case "sha-256": {
          algorithm = "SHA-256";
          break;
        }
      }

      if (!algorithm) throw new Error("Unsupported algorithm: " + alg);

      return async (appSecret: string): Promise<string> => {
        const key = await globalThis.crypto.subtle.importKey(
          "raw",
          strToArrayBuffer(appSecret),
          { name: "HMAC", hash: { name: algorithm } },
          false,
          ["sign"],
        );

        const sig = await globalThis.crypto.subtle.sign(
          "HMAC",
          key,
          strToArrayBuffer(bodyString),
        );

        return arrayBufferToHex(sig);
      };
    }

    function checkSignature(alg: string, signature?: string) {
      const signatureCalculator = getCalculatedSignature(alg);

      return async (appSecret: string): Promise<boolean> => {
        if (!signature) return false;

        const generatedSignature = await signatureCalculator(appSecret);
        const received = Buffer.from(signature, "utf8");
        const generated = Buffer.from(generatedSignature, "utf8");

        return (
          received.length === generated.length &&
          timingSafeEqual(received, generated)
        );
      };
    }

    const checkSignatureSHA256 = checkSignature("sha256", xHubSignature256);

    return {
      /** Webhook Data */
      eventNotification,

      /** Algorithm-Specific X-Hub-Signatures */
      signature: {
        sha1: {
          value: xHubSignature1,
          getCalculatedSignature: getCalculatedSignature("sha1"),
          check: checkSignature("sha1", xHubSignature1),
        },
        sha256: {
          value: xHubSignature256,
          getCalculatedSignature: getCalculatedSignature("sha256"),
          check: checkSignatureSHA256,
        },
      },

      /** Check X-Hub-Signature Validity */
      checkSignature: checkSignatureSHA256,

      /**
       * Assert X-Hub-Signature Validity.
       *
       * Closes over `checkSignatureSHA256` rather than reading `this`, so it
       * keeps working when destructured off the returned object.
       */
      async verifySignature(appSecret: string) {
        if (!(await checkSignatureSHA256(appSecret))) {
          throw new InvalidHubSignatureWebhookError(
            "Webhook Event Notification Signature doesn't match received body",
          );
        }
      },

      /** HTTP Response Content for Webhook Event Acceptance */
      accept: () => {},
    };
  }
}
