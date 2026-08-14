/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

/** Fields shared by Graph API errors wherever they appear. */
export type WhatsappErrorBase = {
  code: number;

  message?: string;

  title?: string;

  error_data?: {
    messaging_product?: "whatsapp";

    /**
     * Error description and a description of the most likely reason for the
     * error. May also contain information on how to address the error, such as
     * which parameter is invalid or what values are acceptable.
     */
    details: string;
  };

  /** Link to the documentation for this error. */
  href?: string;
};

/**
 * An error returned in the body of an HTTP response from the Graph API.
 *
 * Errors embedded in webhook payloads have a different shape - notably they
 * carry no `fbtrace_id` - see {@link WhatsappWebhookError}.
 */
export type WhatsappError = WhatsappErrorBase & {
  type: string;

  error_subcode?: number;

  /**
   * Trace ID you can include when contacting Direct Support. The ID may help
   * support to debug the error.
   */
  fbtrace_id: string;
};

/**
 * An error embedded in a webhook event notification payload.
 *
 * Unlike {@link WhatsappError}, webhook errors are not HTTP responses and carry
 * neither a `fbtrace_id` nor a `type`.
 */
export type WhatsappWebhookError = WhatsappErrorBase;
