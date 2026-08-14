import type { BSUID } from "../Account.js";
import type {
  CreateMessagePayload,
  MessageRecipientType,
} from "../Message/index.js";
import type { CreateMessageTemplate } from "../Message/MessageTemplate.js";
import type { PhoneNumberID, PhoneNumberString } from "../PhoneNumber.js";

export type MarketingMessageProductPolicy = "CLOUD_API_FALLBACK" | "STRICT";

export type MarketingMessageRecipient =
  | { to: PhoneNumberString; recipient?: BSUID }
  | { to?: never; recipient: BSUID };

export type CreateMarketingMessageOptions = MarketingMessageRecipient & {
  phoneNumberID: PhoneNumberID;
  recipientType: Extract<MessageRecipientType, "individual">;
  type: "template";
  template: CreateMessageTemplate;
  productPolicy?: MarketingMessageProductPolicy;
  messageActivitySharing?: boolean;
};

export type CreateMarketingMessagePayload = CreateMessagePayload;
