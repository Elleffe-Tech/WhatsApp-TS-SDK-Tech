import type { WhatsappBusinessAccountID } from "../WhatsappBusinessAccount/index.js";

export type BillingMigrationID = string;
export type BillingMigrationStatus =
  | "INITIATED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "READY_TO_COMPLETE"
  | "COMPLETED"
  | "FAILED"
  | "FAILED_TO_COMPLETE"
  | "REJECTED";

export type CreateBillingMigrationOptions = {
  businessAccountID: WhatsappBusinessAccountID;
  currency: string;
  extended_credit_id?: string;
};

export type CreateBillingMigrationPayload = {
  migration_id: BillingMigrationID;
  migration_status: BillingMigrationStatus;
};

export type BillingMigration = {
  id: BillingMigrationID;
  status: BillingMigrationStatus;
  destination_waba?: {
    id: WhatsappBusinessAccountID;
    name: string;
    currency: string;
    timezone_id: string;
    message_template_namespace: string;
  };
};

export type ResumeBillingMigrationPayload = BillingMigration;
