import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeServiceRequestUserIdNullable1780443600000 implements MigrationInterface {
    name = 'MakeServiceRequestUserIdNullable1780443600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_requests" ALTER COLUMN "user_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "service_requests" SET "user_id" = '00000000-0000-0000-0000-000000000000' WHERE "user_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "service_requests" ALTER COLUMN "user_id" SET NOT NULL`);
    }
}
