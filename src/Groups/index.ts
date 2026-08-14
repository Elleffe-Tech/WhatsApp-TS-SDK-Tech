import type { KyInstance, Options as KyOptions } from "ky";
import type {
  CreateGroupOptions,
  CreateGroupPayload,
  GetGroupOptions,
  GroupID,
  GroupInviteLinkPayload,
  GroupSuccessPayload,
  ListGroupJoinRequestsOptions,
  ListGroupJoinRequestsPayload,
  ListGroupsOptions,
  ListGroupsPayload,
  RemoveGroupParticipantsOptions,
  UpdateGroupJoinRequestsOptions,
  UpdateGroupJoinRequestsPayload,
  UpdateGroupOptions,
  Group,
} from "../types/Groups/index.js";

interface MethodOptions {
  request?: KyOptions;
}

export default class Groups {
  constructor(protected _transport: KyInstance) {}

  private endpoint(groupID: GroupID, edge?: string) {
    return encodeURIComponent(groupID) + (edge ? `/${edge}` : "");
  }

  create({
    phoneNumberID,
    request,
    ...group
  }: MethodOptions & CreateGroupOptions) {
    return this._transport.extend({
      method: "POST",
      json: { messaging_product: "whatsapp", ...group },
    })<CreateGroupPayload>(
      `${encodeURIComponent(phoneNumberID)}/groups`,
      request,
    );
  }

  get({ groupID, fields, request }: MethodOptions & GetGroupOptions) {
    return this._transport.extend({
      method: "GET",
      searchParams: fields ? { fields: fields.join(",") } : undefined,
    })<Group>(this.endpoint(groupID), request);
  }

  list({
    phoneNumberID,
    limit,
    before,
    after,
    request,
  }: MethodOptions & ListGroupsOptions) {
    return this._transport.extend({
      method: "GET",
      searchParams: {
        ...(limit === undefined ? {} : { limit }),
        ...(before ? { before } : {}),
        ...(after ? { after } : {}),
      },
    })<ListGroupsPayload>(
      `${encodeURIComponent(phoneNumberID)}/groups`,
      request,
    );
  }

  update({
    groupID,
    subject,
    description,
    join_approval_mode,
    profilePicture,
    profilePictureFilename,
    request,
  }: MethodOptions & UpdateGroupOptions) {
    if (profilePicture) {
      const body = new FormData();
      body.set("messaging_product", "whatsapp");
      if (subject !== undefined) body.set("subject", subject);
      if (description !== undefined) body.set("description", description);
      if (join_approval_mode !== undefined)
        body.set("join_approval_mode", join_approval_mode);
      // Meta requires a JPEG. Without an explicit filename FormData names the
      // part "blob", which the API rejects.
      body.set(
        "file",
        profilePicture,
        profilePictureFilename ?? "profile_picture.jpg",
      );
      return this._transport.extend({
        method: "POST",
        body,
      })<GroupSuccessPayload>(this.endpoint(groupID), request);
    }

    return this._transport.extend({
      method: "POST",
      json: {
        messaging_product: "whatsapp",
        ...(subject === undefined ? {} : { subject }),
        ...(description === undefined ? {} : { description }),
        ...(join_approval_mode === undefined ? {} : { join_approval_mode }),
      },
    })<GroupSuccessPayload>(this.endpoint(groupID), request);
  }

  delete({ groupID, request }: MethodOptions & { groupID: GroupID }) {
    return this._transport.extend({ method: "DELETE" })<GroupSuccessPayload>(
      this.endpoint(groupID),
      request,
    );
  }

  getInviteLink({ groupID, request }: MethodOptions & { groupID: GroupID }) {
    return this._transport.extend({ method: "GET" })<GroupInviteLinkPayload>(
      this.endpoint(groupID, "invite_link"),
      request,
    );
  }

  resetInviteLink({ groupID, request }: MethodOptions & { groupID: GroupID }) {
    return this._transport.extend({
      method: "POST",
      json: { messaging_product: "whatsapp" },
    })<GroupInviteLinkPayload>(this.endpoint(groupID, "invite_link"), request);
  }

  listJoinRequests({
    groupID,
    limit,
    before,
    after,
    request,
  }: MethodOptions & ListGroupJoinRequestsOptions) {
    return this._transport.extend({
      method: "GET",
      searchParams: {
        ...(limit === undefined ? {} : { limit }),
        ...(before ? { before } : {}),
        ...(after ? { after } : {}),
      },
    })<ListGroupJoinRequestsPayload>(
      this.endpoint(groupID, "join_requests"),
      request,
    );
  }

  approveJoinRequests({
    groupID,
    joinRequests,
    request,
  }: MethodOptions & UpdateGroupJoinRequestsOptions) {
    return this.updateJoinRequests("POST", groupID, joinRequests, request);
  }

  rejectJoinRequests({
    groupID,
    joinRequests,
    request,
  }: MethodOptions & UpdateGroupJoinRequestsOptions) {
    return this.updateJoinRequests("DELETE", groupID, joinRequests, request);
  }

  private updateJoinRequests(
    method: "POST" | "DELETE",
    groupID: GroupID,
    joinRequests: string[],
    request?: KyOptions,
  ) {
    return this._transport.extend({
      method,
      json: {
        messaging_product: "whatsapp",
        join_requests: joinRequests,
      },
    })<UpdateGroupJoinRequestsPayload>(
      this.endpoint(groupID, "join_requests"),
      request,
    );
  }

  removeParticipants({
    groupID,
    participants,
    request,
  }: MethodOptions & RemoveGroupParticipantsOptions) {
    return this._transport.extend({
      method: "DELETE",
      json: { messaging_product: "whatsapp", participants },
    })<GroupSuccessPayload>(this.endpoint(groupID, "participants"), request);
  }
}
