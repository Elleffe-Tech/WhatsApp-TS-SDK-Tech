/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Dom Webber <dom.webber@hotmail.com>
 * @see    https://greatdetail.com
 */

/** WhatsApp Business Account ID */
export type WhatsappBusinessAccountID = string;

export const WHATSAPP_BUSINESS_ACCOUNT_MESSAGE_ELIGIBILITY = [
  "BLOCKED",
  "LIMITED",
  "AVAILABLE",
] as const;
export type WhatsappBusinessAccountMessageEligibility =
  (typeof WHATSAPP_BUSINESS_ACCOUNT_MESSAGE_ELIGIBILITY)[number];

export const WHATSAPP_BUSINESS_ACCOUNT_VERIFICATION_STATUS = [
  "not_verified",
  "expired",
  "failed",
  "ineligible",
  "pending",
  "pending_need_more_info",
  "pending_submission",
  "rejected",
  "revoked",
  "verified",
] as const;
export type WhatsappBusinessAccountVerificationStatus =
  (typeof WHATSAPP_BUSINESS_ACCOUNT_VERIFICATION_STATUS)[number];

export type WhatsappBusinessAccountFields =
  | "account_review_status"
  | "id"
  | "name"
  | "currency"
  | "on_behalf_of_business_info"
  | "primary_funding_id"
  | "purchase_order_number"
  | "timezone_id"
  | "owner_business_info"
  | "business_verification_status"
  | "country"
  | "currency"
  | "health_status"
  | "is_enabled_for_insights"
  | "marketing_messages_lite_api_status"
  | "marketing_messages_onboarding_status"
  | "ownership_type"
  | "status"
  | "whatsapp_business_manager_messaging_limit"
  | "disable_marketing_messages_on_cloud_api"
  | "degrees_of_freedom_spec";

export type WhatsappBusinessAccount = {
  id: WhatsappBusinessAccountID;
  name: string;
  account_review_status: string;
  timezone_id: string;
  owner_business_info: {
    id: string;
    name: string;
  };
  on_behalf_of_business_info?: {
    id: string;
    name: string;
    status: string;
    type: string;
  };
  business_verification_status: WhatsappBusinessAccountVerificationStatus;
  country?: string;
  currency: string;
  is_enabled_for_insights: boolean;
  is_shared_with_partners?: boolean;
  primary_funding_id?: string;
  purchase_order_number?: string;
  marketing_messages_lite_api_status:
    "INELIGIBLE" | "ELIGIBLE" | "ONBOARDED" | "UNKNOWN";
  marketing_messages_onboarding_status:
    | "INELIGIBLE_ON_BEHALF_OF_WABA"
    | "INELIGIBLE_INACTIVE_OR_RESTRICTED"
    | "INELIGIBLE_COUNTRY_NOT_SUPPORTED"
    | "INELIGIBLE_USING_WHATSAPP_BUSINESS_APP"
    | "ELIGIBLE"
    | "PENDING_VALID_PAYMENT_METHOD"
    | "PENDING_INTERNAL_SETUP"
    | "ONBOARDED";
  ownership_type: "CLIENT_OWNED" | unknown;
  status: "ACTIVE";
  whatsapp_business_manager_messaging_limit?: string;
  disable_marketing_messages_on_cloud_api?: boolean;
  degrees_of_freedom_spec?: {
    creative_features_spec: Array<Record<string, "OPT_IN" | "OPT_OUT">>;
  };

  health_status: {
    can_send_message: WhatsappBusinessAccountMessageEligibility;
    entities: {
      id: string;
      entity_type:
        // | "PHONE_NUMBER"
        "WABA" | "BUSINESS" | "APP" | (string & NonNullable<unknown>);
      can_send_message: WhatsappBusinessAccountMessageEligibility;
      additional_info?: string[];
      errors?: {
        error_code?: string;
        error_description: string;
        possible_solution?: string;
      }[];
    }[];
  };
};

export type GetWhatsappBusinessAccountOptions = {
  fields?: WhatsappBusinessAccountFields[];
};

export type GetWhatsappBusinessAccountPayload = WhatsappBusinessAccount;

export type UpdateWhatsappBusinessAccountOptions = {
  disable_marketing_messages_on_cloud_api?: boolean;
  is_enabled_for_insights?: boolean;
  degrees_of_freedom_spec?: {
    creative_features_spec: Record<
      string,
      { enroll_status: "OPT_IN" | "OPT_OUT" }
    >;
  };
};

export type UpdateWhatsappBusinessAccountPayload = {
  id: WhatsappBusinessAccountID;
};
