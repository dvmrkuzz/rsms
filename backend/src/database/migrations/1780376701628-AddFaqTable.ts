import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFaqTable1780376701628 implements MigrationInterface {
    name = 'AddFaqTable1780376701628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "faqs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" text NOT NULL, "answer" text NOT NULL, "category" character varying, "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_by_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "faqs" ADD CONSTRAINT "FK_c15def05db8046c964f418d507e" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faqs" DROP CONSTRAINT "FK_c15def05db8046c964f418d507e"`);
        await queryRunner.query(`DROP TABLE "faqs"`);
    }

}
