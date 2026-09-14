import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPin1793000000000 implements MigrationInterface {
  name = 'AddUserPin1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pin_hash" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "pin_hash"`,
    );
  }
}