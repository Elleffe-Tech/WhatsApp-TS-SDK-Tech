import type { KyInstance, Options as KyOptions } from "ky";
import type {
  AnalyticsPayload,
  ConversationAnalyticsOptions,
  ConversationAnalyticsPayload,
  MessagingAnalyticsOptions,
  MessagingAnalyticsPayload,
  PricingAnalyticsOptions,
  PricingAnalyticsPayload,
  TemplateAnalyticsOptions,
} from "../types/Analytics/index.js";
import type { WhatsappBusinessAccountID } from "../types/WhatsappBusinessAccount/index.js";

interface MethodOptions {
  request?: KyOptions;
}

const array = (values: readonly (string | number)[]) => JSON.stringify(values);

type AnalyticsRange = {
  businessAccountID: WhatsappBusinessAccountID;
  start: number;
  end: number;
  granularity: string;
};

export default class Analytics {
  constructor(protected _transport: KyInstance) {}

  /**
   * Messaging, conversation and pricing analytics are field expansions on the
   * WhatsApp Business Account node rather than edges, so they are requested as
   * `?fields=<field>.start(...).end(...)`. Only `template_analytics` is a real
   * edge - see {@link getTemplate}.
   */
  private wabaField<T>(
    field: string,
    options: AnalyticsRange,
    filters: Record<string, readonly (string | number)[] | undefined>,
    request?: KyOptions,
  ) {
    const expression = [
      field,
      `.start(${options.start})`,
      `.end(${options.end})`,
      `.granularity(${options.granularity})`,
      ...Object.entries(filters)
        .filter((entry): entry is [string, readonly (string | number)[]] =>
          Array.isArray(entry[1]),
        )
        .map(([name, values]) => `.${name}(${array(values)})`),
    ].join("");

    return this._transport.extend({
      method: "GET",
      searchParams: { fields: expression },
    })<T>(encodeURIComponent(options.businessAccountID), request);
  }

  getMessaging(options: MethodOptions & MessagingAnalyticsOptions) {
    const { request, phoneNumbers, countryCodes, productTypes, ...analytics } =
      options;
    return this.wabaField<MessagingAnalyticsPayload>(
      "analytics",
      analytics,
      {
        phone_numbers: phoneNumbers,
        country_codes: countryCodes,
        product_types: productTypes,
      },
      request,
    );
  }

  getConversation(options: MethodOptions & ConversationAnalyticsOptions) {
    const {
      request,
      phoneNumbers,
      metricTypes,
      conversationCategories,
      conversationTypes,
      conversationDirections,
      dimensions,
      ...analytics
    } = options;
    return this.wabaField<ConversationAnalyticsPayload>(
      "conversation_analytics",
      analytics,
      {
        phone_numbers: phoneNumbers,
        metric_types: metricTypes,
        conversation_categories: conversationCategories,
        conversation_types: conversationTypes,
        conversation_directions: conversationDirections,
        dimensions,
      },
      request,
    );
  }

  getPricing(options: MethodOptions & PricingAnalyticsOptions) {
    const {
      request,
      phoneNumbers,
      countryCodes,
      metricTypes,
      pricingTypes,
      pricingCategories,
      dimensions,
      ...analytics
    } = options;
    return this.wabaField<PricingAnalyticsPayload>(
      "pricing_analytics",
      analytics,
      {
        phone_numbers: phoneNumbers,
        country_codes: countryCodes,
        metric_types: metricTypes,
        pricing_types: pricingTypes,
        pricing_categories: pricingCategories,
        dimensions,
      },
      request,
    );
  }

  getTemplate({
    businessAccountID,
    start,
    end,
    granularity,
    templateIDs,
    metricTypes,
    productType,
    useWabaTimezone,
    request,
  }: MethodOptions & TemplateAnalyticsOptions) {
    return this._transport.extend({
      method: "GET",
      searchParams: {
        start,
        end,
        granularity,
        template_ids: array(templateIDs),
        metric_types: array(metricTypes),
        ...(productType ? { product_type: productType } : {}),
        ...(useWabaTimezone === undefined
          ? {}
          : { use_waba_timezone: useWabaTimezone }),
      },
    })<AnalyticsPayload>(
      `${encodeURIComponent(businessAccountID)}/template_analytics`,
      request,
    );
  }
}
