/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

export default class WebhookError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    // Without this every subclass reports `name === "Error"`, which makes the
    // name useless for discriminating between webhook failures.
    this.name = new.target.name;
  }
}
