/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

import type { KyInstance, Options as KyOptions } from "ky";
import ky from "ky";
import Analytics from "./Analytics/index.js";
import BillingMigration from "./BillingMigration/index.js";
import BusinessProfile from "./BusinessProfile/index.js";
import BusinessScopedUsers from "./BusinessScopedUsers/index.js";
import Groups from "./Groups/index.js";
import InAppSignup from "./InAppSignup/index.js";
import Media from "./Media/index.js";
import MarketingMessages from "./MarketingMessages/index.js";
import Message from "./Message/index.js";
import MessagingAccounts from "./MessagingAccounts/index.js";
import PhoneNumbers from "./PhoneNumbers/index.js";
import SubscribedApps from "./SubscribedApps/index.js";
import Template from "./Template/index.js";
import Webhook from "./Webhook/index.js";
import WhatsappBusinessAccount from "./WhatsappBusinessAccount/index.js";

export interface Options {
  baseUrl?: string;
  request?: Omit<KyOptions, "prefixUrl">;
}

/**
 * The (Unofficial) WhatsApp SDK.
 *
 * ```ts
 * // Instantiate the SDK Client
 * const sdk = new Client({
 *   request: {
 *     headers: { Authorization: "Bearer ..." },
 *   },
 * });
 *
 * // Use it!
 * const message = await sdk.message.createMessage({
 *   phoneNumberID: "123...809",
 *   recipientType: "individual",
 *   to: "1234567890",
 *   type: "text",
 *   text: { body: "Hello" },
 * });
 * ```
 *
 * @see https://github.com/great-detail/WhatsApp-JS-SDK
 */
export default class Client {
  public static readonly DEFAULT_GRAPH_BASE_URL = "https://graph.facebook.com";
  public static readonly DEFAULT_GRAPH_VERSION = "v25.0";

  /** Default request timeout, in milliseconds. */
  public static readonly DEFAULT_TIMEOUT = 72_000;

  protected _transport: KyInstance;

  /** Analytics APIs */
  public analytics: Analytics;

  /** Billing migration APIs */
  public billingMigration: BillingMigration;
  /** Business-Profile APIs */
  public businessProfile: BusinessProfile;

  /** Business-scoped user and username APIs */
  public businessScopedUsers: BusinessScopedUsers;

  /** Groups APIs */
  public groups: Groups;

  /** In-App Signup APIs */
  public inAppSignup: InAppSignup;

  /** Media APIs */
  public media: Media;

  /** Marketing Messages APIs */
  public marketingMessages: MarketingMessages;

  /** Messaging APIs */
  public message: Message;

  /** Messaging Account APIs */
  public messagingAccounts: MessagingAccounts;

  /** Phone Number APIs */
  public phoneNumbers: PhoneNumbers;

  /** Subscribed App APIs */
  public subscribedApps: SubscribedApps;

  /** Template APIs */
  public template: Template;

  /** Webhook APIs */
  public webhook: Webhook;

  /** WhatsApp Business Account APIs */
  public whatsappBusinessAccount: WhatsappBusinessAccount;

  constructor({ baseUrl, request }: Options = {}) {
    const cleanBaseUrl = (baseUrl ?? Client.DEFAULT_GRAPH_BASE_URL).replace(
      /\/$/,
      "",
    );
    this._transport = ky.create({
      ...request,
      // `timeout` is a default the caller may override, so it must not be
      // written after the spread. `baseUrl` is derived from the `baseUrl`
      // option and always wins.
      timeout: request?.timeout ?? Client.DEFAULT_TIMEOUT,
      baseUrl: `${cleanBaseUrl}/${Client.DEFAULT_GRAPH_VERSION}/`,
    });

    this.analytics = new Analytics(this._transport);
    this.billingMigration = new BillingMigration(this._transport);
    this.businessProfile = new BusinessProfile(this._transport);
    this.businessScopedUsers = new BusinessScopedUsers(this._transport);
    this.groups = new Groups(this._transport);
    this.inAppSignup = new InAppSignup(this._transport);
    this.media = new Media(this._transport);
    this.marketingMessages = new MarketingMessages(this._transport);
    this.message = new Message(this._transport);
    this.messagingAccounts = new MessagingAccounts(this._transport);
    this.phoneNumbers = new PhoneNumbers(this._transport);
    this.subscribedApps = new SubscribedApps(this._transport);
    this.template = new Template(this._transport);
    this.webhook = new Webhook();
    this.whatsappBusinessAccount = new WhatsappBusinessAccount(this._transport);
  }
}
