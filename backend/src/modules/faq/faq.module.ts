import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { FAQ } from '../../database/entities/faq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ])],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}