import type { KyInstance, Options as KyOptions } from "ky";
import type {
  GetMessagingAccountOptions,
  MessagingAccount,
} from "../types/MessagingAccounts/index.js";

interface MethodOptions {
  request?: KyOptions;
}

export default class MessagingAccounts {
  constructor(protected _transport: KyInstance) {}

  get({
    messagingAccountID,
    fields,
    request,
  }: MethodOptions & GetMessagingAccountOptions) {
    return this._transport.extend({
      method: "GET",
      searchParams: fields ? { fields: fields.join(",") } : undefined,
    })<MessagingAccount>(encodeURIComponent(messagingAccountID), request);
  }
}
