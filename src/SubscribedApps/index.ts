/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

import { KyInstance, Options as KyOptions } from "ky";
import { WhatsappBusinessAccountID } from "../types/WhatsappBusinessAccount/index.js";
import {
  CreateSubscriptionOptions,
  CreateSubscriptionPayload,
  DeleteSubscriptionOptions,
  DeleteSubscriptionPayload,
  ListSubscriptionsOptions,
  ListSubscriptionsPayload,
} from "../types/SubscribedApps/index.js";

interface MethodOptions {
  request?: KyOptions;
}

export default class SubscribedApps {
  constructor(protected _transport: KyInstance) {}

  protected getEndpoint(businessAccountID: WhatsappBusinessAccountID) {
    return encodeURIComponent(businessAccountID) + "/subscribed_apps";
  }

  public createSubscription({
    businessAccountID,
    request,
    ...subscription
  }: MethodOptions & CreateSubscriptionOptions) {
    return this._transport.extend({
      method: "POST",
      json: subscription,
    })<CreateSubscriptionPayload>(this.getEndpoint(businessAccountID), request);
  }

  public listSubscriptions({
    businessAccountID,
    request,
  }: MethodOptions & ListSubscriptionsOptions) {
    return this._transport.extend({
      method: "GET",
    })<ListSubscriptionsPayload>(this.getEndpoint(businessAccountID), request);
  }

  /** Unsubscribe the app from the WhatsApp Business Account's webhooks. */
  public deleteSubscription({
    businessAccountID,
    request,
  }: MethodOptions & DeleteSubscriptionOptions) {
    return this._transport.extend({
      method: "DELETE",
    })<DeleteSubscriptionPayload>(this.getEndpoint(businessAccountID), request);
  }
}
