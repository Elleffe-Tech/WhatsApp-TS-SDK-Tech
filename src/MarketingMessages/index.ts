import type { KyInstance, Options as KyOptions } from "ky";
import type {
  CreateMarketingMessageOptions,
  CreateMarketingMessagePayload,
} from "../types/MarketingMessages/index.js";

interface MethodOptions {
  request?: KyOptions;
}

export default class MarketingMessages {
  constructor(protected _transport: KyInstance) {}

  send({
    phoneNumberID,
    recipientType,
    productPolicy,
    messageActivitySharing,
    request,
    ...message
  }: MethodOptions & CreateMarketingMessageOptions) {
    return this._transport.extend({
      method: "POST",
      json: {
        messaging_product: "whatsapp",
        recipient_type: recipientType,
        ...message,
        ...(productPolicy ? { product_policy: productPolicy } : {}),
        ...(messageActivitySharing === undefined
          ? {}
          : { message_activity_sharing: messageActivitySharing }),
      },
    })<CreateMarketingMessagePayload>(
      `${encodeURIComponent(phoneNumberID)}/marketing_messages`,
      request,
    );
  }
}
