import type { PhoneNumberID } from "../PhoneNumber.js";

/**
 * Notifies of capability changes, including messaging limits and the number of
 * business phone numbers allowed.
 */
export type WebhookEventNotificationBusinessCapabilityUpdateChanges = {
  field: "business_capability_update";
  value: {
    max_daily_conversation_per_phone?: number;
    max_phone_numbers_per_business?: number;
    max_phone_numbers_per_waba?: number;
    phone_number_id?: PhoneNumberID;
  };
};
