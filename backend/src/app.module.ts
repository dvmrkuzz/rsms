import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR } from '@nestjs/core';
import appConfig from './config/app.config';
import { User } from './database/entities/user.entity';
import { DocumentType } from './database/entities/document-type.entity';
import { ServiceRequest } from './database/entities/service-request.entity';
import { VisitorLog } from './database/entities/visitor-log.entity';
import { AuditLog } from './database/entities/audit-log.entity';
import { Inquiry } from './database/entities/inquiry.entity';
import { Announcement } from './database/entities/announcement.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';
import { ServicesModule } from './modules/services/services.module';
import { VisitorsModule } from './modules/visitors/visitors.module';
import { InquiryModule } from './modules/inquiry/inquiry.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { FAQ } from './database/entities/faq.entity';
import { FaqModule } from './modules/faq/faq.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AssistantModule } from './modules/assistant/assistant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get<number>('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        entities: [
          User, DocumentType, ServiceRequest,
          VisitorLog, AuditLog, Inquiry, Announcement, FAQ,
        ],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: config.get('nodeEnv') === 'development',
        ssl: false,
      }),
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 20 }]),
    AuditModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    VisitorsModule,
    InquiryModule,
    AnnouncementsModule,
    FaqModule,
    AnalyticsModule,
    AssistantModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}