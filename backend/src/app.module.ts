import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import appConfig from './config/app.config'; 
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    TypeOrmModule .forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get ('database.host'),
        port: config.get <number> ('database.port'),
        username: config.get ('database.username'),
        password: config.get ('database.password'),
        database: config.get ('database.name'),
        entities: [__dirname + '/database/entities/*.entitiy{.ts, .js'],
        migrations: [__dirname + '/database/migrations/*{.ts, .js'],
        synchronize: false,
        logging: config.get ('nodeEnv') === 'development',
        ssl: false,
      }),
    }),
  ],
})
export class AppModule {}
