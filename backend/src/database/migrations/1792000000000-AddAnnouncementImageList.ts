import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnnouncementImageList1792000000000 implements MigrationInterface {
  name = 'AddAnnouncementImageList1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "image_base64_list" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcements" DROP COLUMN IF EXISTS "image_base64_list"`,
    );
  }
}