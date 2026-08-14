import type { PhoneNumberID } from "../PhoneNumber.js";
import type { WhatsappBusinessAccountID } from "../WhatsappBusinessAccount/index.js";

/**
 * Granularity accepted by the `analytics` (messaging) field.
 *
 * Each analytics field accepts a different set of granularity values, so they
 * are typed separately rather than sharing one union.
 */
export type MessagingAnalyticsGranularity = "HALF_HOUR" | "DAY" | "MONTH";

/** Granularity accepted by the `conversation_analytics` field. */
export type ConversationAnalyticsGranularity =
  "HALF_HOUR" | "DAILY" | "MONTHLY";

/** Granularity accepted by the `pricing_analytics` field. */
export type PricingAnalyticsGranularity = "HALF_HOUR" | "DAILY" | "MONTHLY";

/** Granularity accepted by the `template_analytics` edge. */
export type TemplateAnalyticsGranularity = "DAILY";

export type AnalyticsGranularity =
  | MessagingAnalyticsGranularity
  | ConversationAnalyticsGranularity
  | PricingAnalyticsGranularity;

export type ConversationAnalyticsDimension =
  | "CONVERSATION_CATEGORY"
  | "CONVERSATION_DIRECTION"
  | "CONVERSATION_TYPE"
  | "COUNTRY"
  | "PHONE";

export type PricingAnalyticsDimension =
  "COUNTRY" | "PHONE" | "PRICING_CATEGORY" | "PRICING_TYPE" | "TIER";

export type AnalyticsDimension =
  ConversationAnalyticsDimension | PricingAnalyticsDimension;

/**
 * Product type filter for messaging analytics.
 *
 * - `0` — template messages
 * - `2` — non-template messages
 * - `100` — incoming messages
 */
export type MessagingAnalyticsProductType = 0 | 2 | 100;

export type ConversationAnalyticsMetricType = "COST" | "CONVERSATION";

export type ConversationAnalyticsCategory =
  "AUTHENTICATION" | "MARKETING" | "SERVICE" | "UTILITY";

export type ConversationAnalyticsType =
  "FREE_ENTRY_POINT" | "FREE_TIER" | "REGULAR";

export type ConversationAnalyticsDirection =
  "BUSINESS_INITIATED" | "USER_INITIATED" | "UNKNOWN";

export type PricingAnalyticsMetricType = "COST" | "VOLUME";

export type PricingAnalyticsCategory =
  | "AUTHENTICATION"
  | "AUTHENTICATION_INTERNATIONAL"
  | "MARKETING"
  | "MARKETING_LITE"
  | "SERVICE"
  | "UTILITY"
  | "REFERRAL_CONVERSION";

export type PricingAnalyticsType =
  "FREE_CUSTOMER_SERVICE" | "FREE_ENTRY_POINT" | "REGULAR";

export type TemplateAnalyticsMetricType =
  "SENT" | "DELIVERED" | "READ" | "CLICKED" | "COST";

export type TemplateAnalyticsProductType =
  "CLOUD_API" | "MARKETING_MESSAGES_API_FOR_WHATSAPP";

export type AnalyticsMetricValue =
  | string
  | number
  | boolean
  | null
  | AnalyticsMetricValue[]
  | { [key: string]: AnalyticsMetricValue };

export type AnalyticsDataPoint = {
  start: number;
  end: number;
  [metric: string]: AnalyticsMetricValue;
};

export type AnalyticsSeries = {
  data: Array<{
    waba_timezone?: string;
    granularity: AnalyticsGranularity;
    product_type?:
      "cloud_api" | "marketing_lite" | (string & NonNullable<unknown>);
    data_points: AnalyticsDataPoint[];
  }>;
  paging?: {
    cursors?: { before?: string; after?: string };
  };
};

export type AnalyticsPayload = AnalyticsSeries;

export type MessagingAnalyticsPayload = {
  id: WhatsappBusinessAccountID;
  analytics: AnalyticsSeries;
};

export type ConversationAnalyticsPayload = {
  id: WhatsappBusinessAccountID;
  conversation_analytics: AnalyticsSeries;
};

export type PricingAnalyticsPayload = {
  id: WhatsappBusinessAccountID;
  pricing_analytics: AnalyticsSeries;
};

type BaseAnalyticsRange<G> = {
  businessAccountID: WhatsappBusinessAccountID;
  start: number;
  end: number;
  granularity: G;
};

export type BaseAnalyticsOptions = BaseAnalyticsRange<AnalyticsGranularity>;

export type MessagingAnalyticsOptions =
  BaseAnalyticsRange<MessagingAnalyticsGranularity> & {
    phoneNumbers?: PhoneNumberID[];
    countryCodes?: string[];
    productTypes?: MessagingAnalyticsProductType[];
  };

export type ConversationAnalyticsOptions =
  BaseAnalyticsRange<ConversationAnalyticsGranularity> & {
    phoneNumbers?: PhoneNumberID[];
    metricTypes?: ConversationAnalyticsMetricType[];
    conversationCategories?: ConversationAnalyticsCategory[];
    conversationTypes?: ConversationAnalyticsType[];
    conversationDirections?: ConversationAnalyticsDirection[];
    dimensions?: ConversationAnalyticsDimension[];
  };

export type PricingAnalyticsOptions =
  BaseAnalyticsRange<PricingAnalyticsGranularity> & {
    phoneNumbers?: PhoneNumberID[];
    countryCodes?: string[];
    metricTypes?: PricingAnalyticsMetricType[];
    pricingTypes?: PricingAnalyticsType[];
    pricingCategories?: PricingAnalyticsCategory[];
    dimensions?: PricingAnalyticsDimension[];
  };

export type TemplateAnalyticsOptions =
  BaseAnalyticsRange<TemplateAnalyticsGranularity> & {
    /** Up to 10 template IDs. */
    templateIDs: string[];
    metricTypes: TemplateAnalyticsMetricType[];
    productType?: TemplateAnalyticsProductType;
    useWabaTimezone?: boolean;
  };
