import type { CursorPage } from "../Pagination.js";
import type { WhatsappBusinessAccountID } from "../WhatsappBusinessAccount/index.js";

export type SignupID = string;
export type InAppSignupStatus = "ACTIVE" | "DISABLED";

export type InAppSignup = {
  id: SignupID;
  waba_id: WhatsappBusinessAccountID;
  signup_message: string;
  confirmation_message: string;
  privacy_policy_url: string;
  promo_code?: string;
  status: InAppSignupStatus;
  display_name?: string;
  website_url?: string;
};

export type CreateInAppSignupOptions = {
  businessAccountID: WhatsappBusinessAccountID;
  signup_message: string;
  confirmation_message: string;
  privacy_policy_url: string;
  website_url?: string;
  promo_code?: string;
  display_name?: string;
  policy: {
    tos: "https://www.facebook.com/legal/ads-manager-marketing-messages-terms";
    accepted: true;
  };
};

export type CreateInAppSignupPayload = {
  id: SignupID;
};

export type UpdateInAppSignupOptions = {
  signupID: SignupID;
  status?: InAppSignupStatus;
  signup_message?: string;
  confirmation_message?: string;
  promo_code?: string;
  display_name?: string;
  website_url?: string;
};

export type ListInAppSignupsOptions = {
  businessAccountID: WhatsappBusinessAccountID;
  limit?: number;
  before?: string;
  after?: string;
};

export type ListInAppSignupsPayload = CursorPage<InAppSignup>;

export type MessagingCustomerBase = {
  id: string;
  name: string;
};

export type CreateMessagingCustomerBaseOptions = {
  businessID: string;
  messaging_customer_base_name: string;
};

export type MessagingCustomerBasePayload = {
  messaging_customer_base_id: string;
};

export type ListMessagingCustomerBasesPayload = {
  messaging_customer_bases: MessagingCustomerBase[];
};

export type DefaultMessagingCustomerBasePayload = {
  default_messaging_customer_base_id: string;
  updated_time: string;
};

export type UpdateInAppSignupPayload = { success: true };
