import type { KyInstance, Options as KyOptions } from "ky";
import type {
  BillingMigration as BillingMigrationDetails,
  BillingMigrationID,
  CreateBillingMigrationOptions,
  CreateBillingMigrationPayload,
  ResumeBillingMigrationPayload,
} from "../types/BillingMigration/index.js";

interface MethodOptions {
  request?: KyOptions;
}

export default class BillingMigration {
  constructor(protected _transport: KyInstance) {}

  create({
    businessAccountID,
    request,
    ...migration
  }: MethodOptions & CreateBillingMigrationOptions) {
    return this._transport.extend({
      method: "POST",
      json: migration,
    })<CreateBillingMigrationPayload>(
      `${encodeURIComponent(businessAccountID)}/set_payment_method_migration_intent`,
      request,
    );
  }

  get({
    migrationID,
    request,
  }: MethodOptions & { migrationID: BillingMigrationID }) {
    return this._transport.extend({ method: "GET" })<BillingMigrationDetails>(
      encodeURIComponent(migrationID),
      request,
    );
  }

  resume({
    migrationID,
    request,
  }: MethodOptions & { migrationID: BillingMigrationID }) {
    return this._transport.extend({
      method: "POST",
    })<ResumeBillingMigrationPayload>(
      `${encodeURIComponent(migrationID)}/resume_migration`,
      request,
    );
  }
}
