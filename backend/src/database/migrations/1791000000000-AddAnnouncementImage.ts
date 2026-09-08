import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnnouncementImage1791000000000 implements MigrationInterface {
  name = 'AddAnnouncementImage1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "image_base64" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcements" DROP COLUMN IF EXISTS "image_base64"`,
    );
  }
}