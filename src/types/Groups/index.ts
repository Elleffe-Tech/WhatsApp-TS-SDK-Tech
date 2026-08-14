import type { BSUID } from "../Account.js";
import type { WhatsappError } from "../Error.js";
import type { CursorPage, CursorPaging } from "../Pagination.js";
import type { PhoneNumberID, PhoneNumberString } from "../PhoneNumber.js";

export type GroupID = string;
export type GroupJoinRequestID = string;
export type GroupJoinApprovalMode = "approval_required" | "auto_approve";

export type GroupParticipant = {
  wa_id?: PhoneNumberString;
  user_id?: BSUID;
};

export type GroupParticipantInput = {
  user: PhoneNumberString | BSUID;
};

export type Group = {
  id: GroupID;
  messaging_product: "whatsapp";
  subject?: string;
  description?: string;
  creation_timestamp?: string;
  suspended?: boolean;
  total_participant_count?: number;
  participants?: GroupParticipant[];
  join_approval_mode?: GroupJoinApprovalMode;
};

export type CreateGroupOptions = {
  phoneNumberID: PhoneNumberID;
  subject: string;
  description?: string;
  join_approval_mode?: GroupJoinApprovalMode;
};

export type CreateGroupPayload = {
  messaging_product: "whatsapp";
  group_id: GroupID;
  success: boolean;
};

export type GetGroupField =
  | "subject"
  | "description"
  | "creation_timestamp"
  | "suspended"
  | "total_participant_count"
  | "participants"
  | "join_approval_mode";

export type GetGroupOptions = {
  groupID: GroupID;
  fields?: GetGroupField[];
};

export type ListGroupsOptions = {
  phoneNumberID: PhoneNumberID;
  limit?: number;
  before?: string;
  after?: string;
};

export type ListGroupsPayload = {
  data: {
    groups: Array<Pick<Group, "id" | "subject"> & { created_at: string }>;
  };
  paging?: CursorPaging;
};

export type UpdateGroupOptions = {
  groupID: GroupID;
  subject?: string;
  description?: string;
  join_approval_mode?: GroupJoinApprovalMode;
  profilePicture?: Blob;
  profilePictureFilename?: string;
};

export type GroupSuccessPayload = {
  success: boolean;
};

export type GroupInviteLinkPayload = {
  messaging_product: "whatsapp";
  invite_link: `https://chat.whatsapp.com/${string}` | string;
};

export type GroupJoinRequest = {
  join_request_id: GroupJoinRequestID;
  wa_id?: PhoneNumberString;
  user_id?: BSUID;
  creation_timestamp: string;
};

export type ListGroupJoinRequestsOptions = {
  groupID: GroupID;
  limit?: number;
  before?: string;
  after?: string;
};

export type ListGroupJoinRequestsPayload = CursorPage<GroupJoinRequest>;

export type UpdateGroupJoinRequestsOptions = {
  groupID: GroupID;
  joinRequests: GroupJoinRequestID[];
};

export type FailedGroupJoinRequest = {
  join_request_id: GroupJoinRequestID;
  errors: WhatsappError[];
};

export type UpdateGroupJoinRequestsPayload = {
  messaging_product: "whatsapp";
  approved_join_requests?: GroupJoinRequestID[];
  rejected_join_requests?: GroupJoinRequestID[];
  failed_join_requests?: FailedGroupJoinRequest[];
  errors?: WhatsappError[];
};

export type RemoveGroupParticipantsOptions = {
  groupID: GroupID;
  participants: GroupParticipantInput[];
};
