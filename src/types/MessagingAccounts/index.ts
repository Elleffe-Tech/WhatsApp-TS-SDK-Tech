export type MessagingAccountID = string;

export type MessagingAccount = {
  id: MessagingAccountID;
  primary_funding_id?: string;
};

export type GetMessagingAccountField = "primary_funding_id";

export type GetMessagingAccountOptions = {
  messagingAccountID: MessagingAccountID;
  fields?: GetMessagingAccountField[];
};
