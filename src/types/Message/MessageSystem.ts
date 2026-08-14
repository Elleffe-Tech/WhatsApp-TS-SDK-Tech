/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

import { AccountID, BSUID } from "../Account.js";

export type EventNotificationMessageSystem = {
  /**
   * Describes the change to the customer's identity or phone number.
   */
  body: string;

  /**
   * Hash for the identity fetched from server.
   */
  identity?: string;

  /**
   * The WhatsApp ID for the customer prior to the update.
   */
  customer?: AccountID;

  /**
   * Type of system update.
   */
  type:
    | "user_changed_number"
    | "user_changed_user_id"
    | "customer_identity_changed"
    | (string & NonNullable<unknown>);

  /**
   * New WhatsApp ID for the customer when their phone number is updated.
   */
  wa_id?: AccountID;

  /** The customer's business-scoped user ID after the change. */
  user_id?: BSUID;

  /** The customer's parent business-scoped user ID after the change. */
  parent_user_id?: BSUID;

  /** The customer's business-scoped user ID before the change. */
  previous_user_id?: BSUID;

  /** The customer's parent business-scoped user ID before the change. */
  previous_parent_user_id?: BSUID;
};
