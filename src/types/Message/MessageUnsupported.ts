/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

export type EventNotificationMessageUnsupported = {
  type:
    | "ephemeral"
    | "view_once"
    | "edited"
    | "revoked"
    | "unknown"
    | (string & NonNullable<unknown>);
};
