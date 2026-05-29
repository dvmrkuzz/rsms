import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { User } from './database/entities/user.entity';
import { DocumentType } from './database/entities/document-type.entity';
import { ServiceRequest } from './database/entities/service-request.entity';
import { VisitorLog } from './database/entities/visitor-log.entity';
import { AuditLog } from './database/entities/audit-log.entity';
import { Inquiry } from './database/entities/inquiry.entity';
import { Announcement } from './database/entities/announcement.entity';

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
          User,
          DocumentType,
          ServiceRequest,
          VisitorLog,
          AuditLog,
          Inquiry,
          Announcement,
        ],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: config.get('nodeEnv') === 'development',
        ssl: false,
      }),
    }),
  ],
})
export class AppModule {}