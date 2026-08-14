import type { KyInstance, Options as KyOptions } from "ky";
import type {
  CreateInAppSignupOptions,
  CreateInAppSignupPayload,
  CreateMessagingCustomerBaseOptions,
  DefaultMessagingCustomerBasePayload,
  InAppSignup as InAppSignupDetails,
  ListMessagingCustomerBasesPayload,
  ListInAppSignupsOptions,
  ListInAppSignupsPayload,
  MessagingCustomerBasePayload,
  SignupID,
  UpdateInAppSignupOptions,
  UpdateInAppSignupPayload,
} from "../types/InAppSignup/index.js";
import type { WhatsappBusinessAccountID } from "../types/WhatsappBusinessAccount/index.js";

interface MethodOptions {
  request?: KyOptions;
}

export default class InAppSignup {
  constructor(protected _transport: KyInstance) {}

  create({
    businessAccountID,
    request,
    ...signup
  }: MethodOptions & CreateInAppSignupOptions) {
    return this._transport.extend({
      method: "POST",
      json: signup,
    })<CreateInAppSignupPayload>(
      `${encodeURIComponent(businessAccountID)}/signups`,
      request,
    );
  }

  get({ signupID, request }: MethodOptions & { signupID: SignupID }) {
    return this._transport.extend({ method: "GET" })<InAppSignupDetails>(
      `signups/${encodeURIComponent(signupID)}`,
      request,
    );
  }

  list({
    businessAccountID,
    limit,
    before,
    after,
    request,
  }: MethodOptions & ListInAppSignupsOptions) {
    return this._transport.extend({
      method: "GET",
      searchParams: {
        ...(limit === undefined ? {} : { limit }),
        ...(before ? { before } : {}),
        ...(after ? { after } : {}),
      },
    })<ListInAppSignupsPayload>(
      `${encodeURIComponent(businessAccountID)}/signups`,
      request,
    );
  }

  update({
    signupID,
    request,
    ...signup
  }: MethodOptions & UpdateInAppSignupOptions) {
    return this._transport.extend({
      method: "POST",
      json: signup,
    })<UpdateInAppSignupPayload>(
      `signups/${encodeURIComponent(signupID)}`,
      request,
    );
  }

  createMessagingCustomerBase({
    businessID,
    request,
    ...customerBase
  }: MethodOptions & CreateMessagingCustomerBaseOptions) {
    return this._transport.extend({
      method: "POST",
      json: customerBase,
    })<MessagingCustomerBasePayload>(
      `${encodeURIComponent(businessID)}/messaging_customer_base`,
      request,
    );
  }

  getMessagingCustomerBases({
    businessID,
    request,
  }: MethodOptions & { businessID: string }) {
    return this._transport.extend({
      method: "GET",
    })<ListMessagingCustomerBasesPayload>(
      `${encodeURIComponent(businessID)}/messaging_customer_base`,
      request,
    );
  }

  setDefaultMessagingCustomerBase({
    businessAccountID,
    messagingCustomerBaseID,
    request,
  }: MethodOptions & {
    businessAccountID: WhatsappBusinessAccountID;
    messagingCustomerBaseID: string;
  }) {
    return this._transport.extend({
      method: "POST",
      json: { messaging_customer_base_id: messagingCustomerBaseID },
    })<DefaultMessagingCustomerBasePayload>(
      `${encodeURIComponent(businessAccountID)}/default_messaging_customer_base`,
      request,
    );
  }

  getDefaultMessagingCustomerBase({
    businessAccountID,
    request,
  }: MethodOptions & { businessAccountID: WhatsappBusinessAccountID }) {
    return this._transport.extend({
      method: "GET",
    })<DefaultMessagingCustomerBasePayload>(
      `${encodeURIComponent(businessAccountID)}/default_messaging_customer_base`,
      request,
    );
  }
}
