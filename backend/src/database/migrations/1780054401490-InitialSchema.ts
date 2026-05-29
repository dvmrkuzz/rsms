import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1780054401490 implements MigrationInterface {
    name = 'InitialSchema1780054401490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "processing_days" integer NOT NULL DEFAULT '3', "fee" numeric(10,2) NOT NULL DEFAULT '0', "requires_clearance" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_803cd247b7c1c8d91b30a3eb210" UNIQUE ("name"), CONSTRAINT "PK_d467d7eeb7c8ce216e90e8494aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service_requests_status_enum" AS ENUM('pending', 'processing', 'ready', 'released', 'cancelled', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "service_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "document_type_id" uuid NOT NULL, "status" "public"."service_requests_status_enum" NOT NULL DEFAULT 'pending', "purpose" character varying, "copies" integer NOT NULL DEFAULT '1', "remarks" character varying, "rejection_reason" character varying, "tracking_number" character varying, "requested_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2c5bc9f13478acc3f298e5966c9" UNIQUE ("tracking_number"), CONSTRAINT "PK_ee60bcd826b7e130bfbd97daf66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'release', 'export')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "action" "public"."audit_logs_action_enum" NOT NULL, "entity_name" character varying NOT NULL, "entity_id" character varying, "old_value" jsonb, "new_value" jsonb, "ip_address" character varying, "user_agent" character varying, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."visitor_logs_purpose_enum" AS ENUM('inquiry', 'document_request', 'follow_up', 'consultation', 'other')`);
        await queryRunner.query(`CREATE TABLE "visitor_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "visitor_name" character varying NOT NULL, "contact_number" character varying, "student_id" character varying, "purpose" "public"."visitor_logs_purpose_enum" NOT NULL DEFAULT 'inquiry', "purpose_details" character varying, "served_by_id" uuid, "time_in" TIMESTAMP NOT NULL, "time_out" TIMESTAMP, "notes" character varying, CONSTRAINT "PK_8a7e7364234b90cb56aff2f1f26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."announcements_target_enum" AS ENUM('all', 'students', 'staff', 'kiosk')`);
        await queryRunner.query(`CREATE TABLE "announcements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_id" uuid NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "target" "public"."announcements_target_enum" NOT NULL DEFAULT 'all', "is_active" boolean NOT NULL DEFAULT true, "expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b3ad760876ff2e19d58e05dc8b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'staff', 'student')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" character varying, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'student', "is_active" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4bcc4fd204f448ad671c0747ab4" UNIQUE ("student_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."inquiries_interface_enum" AS ENUM('kiosk', 'dashboard', 'asksorsu')`);
        await queryRunner.query(`CREATE TABLE "inquiries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" character varying NOT NULL, "question" text NOT NULL, "answer" text, "interface" "public"."inquiries_interface_enum" NOT NULL DEFAULT 'asksorsu', "is_helpful" boolean, "feedback_note" character varying, "asked_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ceacaa439988b25eb9459e694d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_c38549a33af09d8cf92e9878a17" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_c494abb3d6174e32f450ef52cae" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" ADD CONSTRAINT "FK_7f835042d1a2b47c236a07ae6e7" FOREIGN KEY ("served_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD CONSTRAINT "FK_4a7663c7be336b96d81d876e16e" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcements" DROP CONSTRAINT "FK_4a7663c7be336b96d81d876e16e"`);
        await queryRunner.query(`ALTER TABLE "visitor_logs" DROP CONSTRAINT "FK_7f835042d1a2b47c236a07ae6e7"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT "FK_c494abb3d6174e32f450ef52cae"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT "FK_c38549a33af09d8cf92e9878a17"`);
        await queryRunner.query(`DROP TABLE "inquiries"`);
        await queryRunner.query(`DROP TYPE "public"."inquiries_interface_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "announcements"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_target_enum"`);
        await queryRunner.query(`DROP TABLE "visitor_logs"`);
        await queryRunner.query(`DROP TYPE "public"."visitor_logs_purpose_enum"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TABLE "service_requests"`);
        await queryRunner.query(`DROP TYPE "public"."service_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "document_types"`);
    }

}
