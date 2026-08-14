import type { KyInstance, Options as KyOptions } from "ky";
import type {
  BusinessUsernamePayload,
  BusinessUsernameSuggestionsPayload,
  DeleteContactBookEntryPayload,
  DeleteContactBookEntryOptions,
  ListBlockedUsersOptions,
  ListBlockedUsersPayload,
  ParentBSUIDAccountPayload,
  SetBusinessUsernameOptions,
  SetBusinessUsernamePayload,
  SuccessPayload,
  UpdateBlockedUsersOptions,
  UpdateBlockedUsersPayload,
} from "../types/BusinessScopedUsers/index.js";
import type { PhoneNumberID } from "../types/PhoneNumber.js";

interface MethodOptions {
  request?: KyOptions;
}

export default class BusinessScopedUsers {
  constructor(protected _graphTransport: KyInstance) {}

  private phoneEdge(phoneNumberID: PhoneNumberID, edge: string) {
    return `${encodeURIComponent(phoneNumberID)}/${edge}`;
  }

  setUsername({
    phoneNumberID,
    username,
    transferAction,
    request,
  }: MethodOptions & SetBusinessUsernameOptions) {
    return this._graphTransport.extend({
      method: "POST",
      json: {
        username,
        ...(transferAction ? { transfer_action: transferAction } : {}),
      },
    })<SetBusinessUsernamePayload>(
      this.phoneEdge(phoneNumberID, "username"),
      request,
    );
  }

  getUsername({
    phoneNumberID,
    request,
  }: MethodOptions & { phoneNumberID: PhoneNumberID }) {
    return this._graphTransport.extend({
      method: "GET",
    })<BusinessUsernamePayload>(
      this.phoneEdge(phoneNumberID, "username"),
      request,
    );
  }

  listUsernameSuggestions({
    phoneNumberID,
    request,
  }: MethodOptions & { phoneNumberID: PhoneNumberID }) {
    return this._graphTransport.extend({
      method: "GET",
    })<BusinessUsernameSuggestionsPayload>(
      this.phoneEdge(phoneNumberID, "username_suggestions"),
      request,
    );
  }

  deleteUsername({
    phoneNumberID,
    request,
  }: MethodOptions & { phoneNumberID: PhoneNumberID }) {
    return this._graphTransport.extend({ method: "DELETE" })<SuccessPayload>(
      this.phoneEdge(phoneNumberID, "username"),
      request,
    );
  }

  deleteContactBookEntry({
    phoneNumberID,
    bsuid,
    request,
  }: MethodOptions & DeleteContactBookEntryOptions) {
    return this._graphTransport.extend({
      method: "DELETE",
      searchParams: { messaging_product: "whatsapp", bsuid },
    })<DeleteContactBookEntryPayload>(
      this.phoneEdge(phoneNumberID, "contact_book"),
      request,
    );
  }

  blockUsers({
    phoneNumberID,
    users,
    request,
  }: MethodOptions & UpdateBlockedUsersOptions) {
    return this.updateBlockedUsers("POST", phoneNumberID, users, request);
  }

  unblockUsers({
    phoneNumberID,
    users,
    request,
  }: MethodOptions & UpdateBlockedUsersOptions) {
    return this.updateBlockedUsers("DELETE", phoneNumberID, users, request);
  }

  private updateBlockedUsers(
    method: "POST" | "DELETE",
    phoneNumberID: PhoneNumberID,
    users: UpdateBlockedUsersOptions["users"],
    request?: KyOptions,
  ) {
    return this._graphTransport.extend({
      method,
      json: { messaging_product: "whatsapp", block_users: users },
    })<UpdateBlockedUsersPayload>(
      this.phoneEdge(phoneNumberID, "block_users"),
      request,
    );
  }

  listBlockedUsers({
    phoneNumberID,
    limit,
    before,
    after,
    request,
  }: MethodOptions & ListBlockedUsersOptions) {
    return this._graphTransport.extend({
      method: "GET",
      searchParams: {
        ...(limit === undefined ? {} : { limit }),
        ...(before ? { before } : {}),
        ...(after ? { after } : {}),
      },
    })<ListBlockedUsersPayload>(
      this.phoneEdge(phoneNumberID, "block_users"),
      request,
    );
  }

  getParentAccount({
    businessID,
    request,
  }: MethodOptions & { businessID: string }) {
    return this._graphTransport.extend({
      method: "GET",
    })<ParentBSUIDAccountPayload>(
      `${encodeURIComponent(businessID)}/parent-bsuid-accounts`,
      request,
    );
  }
}
