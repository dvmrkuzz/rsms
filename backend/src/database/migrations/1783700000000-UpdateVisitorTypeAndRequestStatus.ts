import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVisitorTypeAndRequestStatus1783700000000
  implements MigrationInterface
{
  name = 'UpdateVisitorTypeAndRequestStatus1783700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── 1. visitor_type enum + column on visitor_logs ──────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "visitor_logs_visitor_type_enum"
          AS ENUM ('student', 'alumni', 'non_student');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "visitor_logs"
        ADD COLUMN IF NOT EXISTS "visitor_type"
          "visitor_logs_visitor_type_enum" NOT NULL DEFAULT 'non_student'
    `);

    // ─── 2. Fix visitor_logs.document_type_id: varchar → uuid + FK ──────────
    // Existing column is character varying; document_types.id is uuid.
    // NULLIF handles empty strings; invalid values would abort safely.
    const colType: Array<{ data_type: string }> = await queryRunner.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'visitor_logs' AND column_name = 'document_type_id'
    `);

    if (colType.length > 0 && colType[0].data_type !== 'uuid') {
      await queryRunner.query(`
        ALTER TABLE "visitor_logs"
          ALTER COLUMN "document_type_id" TYPE uuid
          USING NULLIF("document_type_id", '')::uuid
      `);
    }

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "visitor_logs"
          ADD CONSTRAINT "FK_visitor_logs_document_type"
          FOREIGN KEY ("document_type_id")
          REFERENCES "document_types"("id")
          ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // ─── 3. service_requests.user_id → nullable (kiosk walk-ins) ────────────
    await queryRunner.query(`
      ALTER TABLE "service_requests"
        ALTER COLUMN "user_id" DROP NOT NULL
    `);

    // ─── 4. Rebuild status enum with dual-path workflow ─────────────────────
    // Target: pending | processing | forwarded_to_main | ready_for_pickup | released
    // plus any other existing labels (e.g. rejected) preserved.
    // Old label 'ready' is renamed to 'ready_for_pickup'.

    const labelRows: Array<{ enumlabel: string }> = await queryRunner.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'service_requests_status_enum'
      ORDER BY e.enumsortorder
    `);
    const existing = labelRows.map((r) => r.enumlabel);

    const core = [
      'pending',
      'processing',
      'forwarded_to_main',
      'ready_for_pickup',
      'released',
    ];
    // Preserve any extra labels the project already uses (e.g. 'rejected'),
    // excluding 'ready' which is being renamed.
    const extras = existing.filter(
      (v) => !core.includes(v) && v !== 'ready',
    );
    const target = [...core, ...extras];

    const alreadyCorrect =
      existing.length === target.length &&
      target.every((v) => existing.includes(v));

    if (!alreadyCorrect) {
      await queryRunner.query(`
        ALTER TYPE "service_requests_status_enum"
          RENAME TO "service_requests_status_enum_old"
      `);
      await queryRunner.query(`
        CREATE TYPE "service_requests_status_enum"
          AS ENUM (${target.map((v) => `'${v}'`).join(', ')})
      `);
      await queryRunner.query(`
        ALTER TABLE "service_requests" ALTER COLUMN "status" DROP DEFAULT
      `);
      await queryRunner.query(`
        ALTER TABLE "service_requests"
          ALTER COLUMN "status" TYPE "service_requests_status_enum"
          USING (
            CASE WHEN "status"::text = 'ready'
                 THEN 'ready_for_pickup'
                 ELSE "status"::text
            END
          )::"service_requests_status_enum"
      `);
      await queryRunner.query(`
        ALTER TABLE "service_requests"
          ALTER COLUMN "status" SET DEFAULT 'pending'
      `);
      await queryRunner.query(`
        DROP TYPE "service_requests_status_enum_old"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse status enum: ready_for_pickup → ready, remove forwarded_to_main
    await queryRunner.query(`
      ALTER TYPE "service_requests_status_enum"
        RENAME TO "service_requests_status_enum_new"
    `);
    await queryRunner.query(`
      CREATE TYPE "service_requests_status_enum"
        AS ENUM ('pending', 'processing', 'ready', 'released')
    `);
    await queryRunner.query(`
      ALTER TABLE "service_requests" ALTER COLUMN "status" DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE "service_requests"
        ALTER COLUMN "status" TYPE "service_requests_status_enum"
        USING (
          CASE
            WHEN "status"::text = 'ready_for_pickup' THEN 'ready'
            WHEN "status"::text = 'forwarded_to_main' THEN 'processing'
            ELSE "status"::text
          END
        )::"service_requests_status_enum"
    `);
    await queryRunner.query(`
      ALTER TABLE "service_requests"
        ALTER COLUMN "status" SET DEFAULT 'pending'
    `);
    await queryRunner.query(`
      DROP TYPE "service_requests_status_enum_new"
    `);

    // Restore user_id NOT NULL (only valid if no kiosk rows exist)
    await queryRunner.query(`
      ALTER TABLE "service_requests"
        ALTER COLUMN "user_id" SET NOT NULL
    `);

    // Remove visitor_type
    await queryRunner.query(`
      ALTER TABLE "visitor_logs" DROP COLUMN IF EXISTS "visitor_type"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "visitor_logs_visitor_type_enum"
    `);

    // Revert document_type_id to varchar and drop FK
    await queryRunner.query(`
      ALTER TABLE "visitor_logs"
        DROP CONSTRAINT IF EXISTS "FK_visitor_logs_document_type"
    `);
    await queryRunner.query(`
      ALTER TABLE "visitor_logs"
        ALTER COLUMN "document_type_id" TYPE character varying
        USING "document_type_id"::text
    `);
  }
}
