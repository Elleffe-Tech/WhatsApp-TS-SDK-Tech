/**
 * WhatsApp NodeJS SDK.
 *
 * @author Great Detail Ltd <info@greatdetail.com>
 * @author Lucas Neves <lcneves@gmail.com>
 * @see    https://greatdetail.com
 */

import { CreateMessageMedia } from "./MessageMedia.js";

type InteractiveBody = {
  /** Max 4096 for list messages, max 1024 for button/carousel messages. */
  text: string;
};

type InteractiveFooter = {
  /** Max 60 characters. */
  text: string;
};

type InteractiveHeaderText = {
  type: "text";
  /** Max 60 characters. */
  text: string;
};

type InteractiveHeaderImage = {
  type: "image";
  image: Omit<CreateMessageMedia, "caption" | "filename">;
};

type InteractiveHeaderVideo = {
  type: "video";
  video: Omit<CreateMessageMedia, "caption" | "filename">;
};

type InteractiveHeaderDocument = {
  type: "document";
  document: Omit<CreateMessageMedia, "caption">;
};

type InteractiveHeader =
  | InteractiveHeaderText
  | InteractiveHeaderImage
  | InteractiveHeaderVideo
  | InteractiveHeaderDocument;

type InteractiveMediaHeader =
  InteractiveHeaderImage | InteractiveHeaderVideo | InteractiveHeaderDocument;

type InteractiveCTAUrlAction = {
  name: "cta_url";
  parameters: {
    /** Button label text. At most 20 characters. */
    display_text: string;
    url: string;
  };
};

export type CreateInteractiveCTAUrl = {
  type: "cta_url";
  header?: InteractiveHeader;
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: InteractiveCTAUrlAction;
};

export type CreateInteractiveList = {
  type: "list";
  header?: InteractiveHeaderText;
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: {
    /** Supports a single button. Max 20 characters. */
    button: string;
    sections: Array<{
      /** Max 24 characters. */
      title: string;
      rows: Array<{
        /** Max 200 characters. */
        id: string;
        /** Max 24 characters. */
        title: string;
        /** Max 72 characters. */
        description?: string;
      }>;
    }>;
  };
};

type CreateInteractiveCarouselQuickReplyButton = {
  type: "quick_reply";
  quick_reply: {
    id: string;
    title: string;
  };
};

type CreateInteractiveCarouselUrlCard = {
  card_index: number;
  type: "cta_url";
  header: InteractiveMediaHeader;
  body?: InteractiveBody;
  action:
    | InteractiveCTAUrlAction
    | {
        buttons: Array<CreateInteractiveCarouselQuickReplyButton>;
      };
};

type CreateInteractiveCarouselProductCard = {
  card_index: number;
  type: "product";
  action: {
    product_retailer_id: string;
    catalog_id: string;
  };
};

export type CreateInteractiveCarousel = {
  type: "carousel";
  body: InteractiveBody;
  action: {
    cards: Array<
      CreateInteractiveCarouselUrlCard | CreateInteractiveCarouselProductCard
    >;
  };
};

export type CreateInteractiveButton = {
  type: "button";
  header?: InteractiveHeader;
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: {
    buttons: Array<{
      type: "reply";
      reply: {
        /** Max 256 characters. */
        id: string;
        /** Must be unique across buttons. Max 20 characters. */
        title: string;
      };
    }>;
  };
};

export type CreateInteractiveLocationRequest = {
  type: "location_request_message";
  body: InteractiveBody;
  action: { name: "send_location" };
};

/**
 * Requests the WhatsApp user's permission for the business to call them.
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling
 */
export type CreateInteractiveCallPermissionRequest = {
  type: "call_permission_request";
  body: InteractiveBody;
  action: { name: "call_permission_request" };
};

/**
 * Displays a product catalog, optionally with a product as the thumbnail.
 */
export type CreateInteractiveCatalogMessage = {
  type: "catalog_message";
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: {
    name: "catalog_message";
    parameters?: {
      thumbnail_product_retailer_id: string;
    };
  };
};

export type CreateInteractiveProduct = {
  type: "product";
  body?: InteractiveBody;
  footer?: InteractiveFooter;
  action: {
    catalog_id: string;
    product_retailer_id: string;
  };
};

export type CreateInteractiveProductList = {
  type: "product_list";
  header: InteractiveHeaderText;
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: {
    catalog_id: string;
    sections: Array<{
      title: string;
      product_items: Array<{ product_retailer_id: string }>;
    }>;
  };
};

export type PaymentAmount = {
  value: number;
  offset: number;
};

export type PaymentOrderItem = {
  retailer_id: string;
  name: string;
  amount: PaymentAmount;
  quantity: number;
  sale_amount?: PaymentAmount;
};

export type CreateInteractiveOrderDetails = {
  type: "order_details";
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: {
    name: "review_and_pay";
    parameters: {
      reference_id: string;
      type: "digital-goods" | "physical-goods";
      payment_type: "payment_gateway" | "payment_link" | "cash_voucher";
      payment_configuration?: string;
      currency: string;
      total_amount: PaymentAmount;
      order: {
        status: "pending";
        items: PaymentOrderItem[];
        subtotal: PaymentAmount;
        tax?: PaymentAmount & { description?: string };
        shipping?: PaymentAmount & { description?: string };
        discount?: PaymentAmount & { description?: string };
      };
    };
  };
};

export type CreateInteractiveOrderStatus = {
  type: "order_status";
  body: InteractiveBody;
  action: {
    name: "review_order";
    parameters: {
      reference_id: string;
      order: {
        status:
          | "pending"
          | "processing"
          | "partially_shipped"
          | "shipped"
          | "completed"
          | "canceled";
        description: string;
      };
    };
  };
};

export type CreateMessageInteractive =
  | CreateInteractiveCTAUrl
  | CreateInteractiveList
  | CreateInteractiveCarousel
  | CreateInteractiveButton
  | CreateInteractiveLocationRequest
  | CreateInteractiveCallPermissionRequest
  | CreateInteractiveCatalogMessage
  | CreateInteractiveProduct
  | CreateInteractiveProductList
  | CreateInteractiveOrderDetails
  | CreateInteractiveOrderStatus;

export type EventNotificationMessageInteractive =
  | {
      type: "button_reply";
      button_reply: {
        id: string;
        title: string;
      };
    }
  | {
      type: "list_reply";
      list_reply: {
        id: string;
        title: string;
        description?: string;
      };
    }
  | {
      type: "nfm_reply";
      nfm_reply: {
        name: string;
        body: string;
        response_json: string;
      };
    }
  | {
      type: "product";
      product: {
        catalog_id: string;
        product_retailer_id: string;
      };
    };
