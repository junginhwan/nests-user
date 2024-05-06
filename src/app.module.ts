import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './config/emailConfig';

@Module({
  imports: [UsersModule,
  ConfigModule.forRoot({
    envFilePath: [`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
    load: [emailConfig],
    isGlobal: true,
  })],
  controllers: [],
  providers: [],
})
export class AppModule {}
