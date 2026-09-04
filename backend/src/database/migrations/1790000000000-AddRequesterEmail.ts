import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequesterEmail1790000000000 implements MigrationInterface {
  name = 'AddRequesterEmail1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "requester_email" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_requests" DROP COLUMN IF EXISTS "requester_email"`,
    );
  }
}