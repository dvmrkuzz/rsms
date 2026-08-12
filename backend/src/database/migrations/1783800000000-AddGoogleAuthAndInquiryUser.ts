import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleAuthAndInquiryUser1783800000000 implements MigrationInterface {
    name = 'AddGoogleAuthAndInquiryUser1783800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "google_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id")`);

        await queryRunner.query(`ALTER TABLE "inquiries" ADD "user_id" uuid`);
        await queryRunner.query(`
            ALTER TABLE "inquiries"
            ADD CONSTRAINT "FK_inquiries_user_id"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inquiries" DROP CONSTRAINT "FK_inquiries_user_id"`);
        await queryRunner.query(`ALTER TABLE "inquiries" DROP COLUMN "user_id"`);

        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_google_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`);
    }
}
