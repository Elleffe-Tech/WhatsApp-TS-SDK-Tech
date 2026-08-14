import type { BSUID } from "../Account.js";
import type { CursorPage } from "../Pagination.js";
import type { PhoneNumberID, PhoneNumberString } from "../PhoneNumber.js";

export type UsernameTransferAction = "none" | "force_transfer";
export type BusinessUsernameStatus = "approved" | "reserved";

export type SetBusinessUsernameOptions = {
  phoneNumberID: PhoneNumberID;
  username: string;
  transferAction?: UsernameTransferAction;
};

export type SetBusinessUsernamePayload = {
  status: BusinessUsernameStatus;
};

export type BusinessUsernamePayload = {
  username?: string;
  status: BusinessUsernameStatus;
};

export type BusinessUsernameSuggestionsPayload = {
  data: Array<{ username_suggestions: string[] }>;
};

export type DeleteContactBookEntryOptions = {
  phoneNumberID: PhoneNumberID;
  bsuid: BSUID;
};

export type BlockedUserInput =
  | { user: PhoneNumberString; user_id?: BSUID }
  | { user?: never; user_id: BSUID };

export type UpdateBlockedUsersOptions = {
  phoneNumberID: PhoneNumberID;
  users: BlockedUserInput[];
};

export type BlockedUser = {
  messaging_product: "whatsapp";
  wa_id?: PhoneNumberString;
  user_id?: BSUID;
  parent_user_id?: BSUID;
};

export type UpdatedBlockedUser = {
  input: PhoneNumberString | BSUID;
  wa_id?: PhoneNumberString;
  user_id?: BSUID;
};

export type UpdateBlockedUsersPayload = {
  messaging_product: "whatsapp";
  block_users: {
    added_users?: UpdatedBlockedUser[];
    removed_users?: UpdatedBlockedUser[];
  };
};

export type ListBlockedUsersOptions = {
  phoneNumberID: PhoneNumberID;
  limit?: number;
  before?: string;
  after?: string;
};

export type ListBlockedUsersPayload = CursorPage<BlockedUser>;

export type ParentBSUIDAccountPayload = {
  parent_bsuid_account_id: string;
  enrolled_business_portfolios: string[];
};

export type DeleteContactBookEntryPayload = {
  messaging_product: "whatsapp";
  success: boolean;
  deleted: boolean;
};

export type SuccessPayload = { success: boolean };
