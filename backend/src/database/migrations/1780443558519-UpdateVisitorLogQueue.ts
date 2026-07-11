import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateVisitorLogQueue1780443558519 implements MigrationInterface {
    name = 'UpdateVisitorLogQueue1780443558519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visitor_logs" DROP COLUMN IF EXISTS "purpose_details"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ADD IF NOT EXISTS "queue_number" character varying`);
        await queryRunner.query(`UPDATE "visitor_logs" SET "queue_number" = 'Q-000' WHERE "queue_number" IS NULL`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ALTER COLUMN "queue_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ADD IF NOT EXISTS "document_type_id" character varying`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ADD IF NOT EXISTS "tracking_number" character varying`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ADD IF NOT EXISTS "is_served" boolean NOT NULL DEFAULT false`);
        
        await queryRunner.query(`ALTER TYPE "public"."visitor_logs_purpose_enum" RENAME TO "visitor_logs_purpose_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."visitor_logs_purpose_enum" AS ENUM('document_request', 'pick_up')`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ALTER COLUMN "purpose" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ALTER COLUMN "purpose" TYPE "public"."visitor_logs_purpose_enum" USING 'document_request'::"public"."visitor_logs_purpose_enum"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ALTER COLUMN "purpose" SET DEFAULT 'document_request'`);
        await queryRunner.query(`DROP TYPE "public"."visitor_logs_purpose_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."visitor_logs_purpose_enum_old" AS ENUM('inquiry', 'document_request', 'follow_up', 'consultation', 'other')`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ALTER COLUMN "purpose" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ALTER COLUMN "purpose" TYPE "public"."visitor_logs_purpose_enum_old" USING "purpose"::"text"::"public"."visitor_logs_purpose_enum_old"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ALTER COLUMN "purpose" SET DEFAULT 'inquiry'`);
        await queryRunner.query(`DROP TYPE "public"."visitor_logs_purpose_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."visitor_logs_purpose_enum_old" RENAME TO "visitor_logs_purpose_enum"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" DROP COLUMN IF EXISTS "is_served"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" DROP COLUMN IF EXISTS "tracking_number"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" DROP COLUMN IF EXISTS "document_type_id"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" DROP COLUMN IF EXISTS "queue_number"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ADD "purpose_details" character varying`);
    }
}