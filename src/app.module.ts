/**
 * @fileoverview Main application module
 * @description Root module that imports all feature modules
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './domains/user/user.module';
import { GreenWasteAiModule } from './domains/green-waste-ai/green-waste-ai.module';
import { MailerModule } from './libs/mailer/mailer.module';
import { CloudinaryModule } from './libs/cloudinary/cloudinary.module';
import { GoogleGenAiModule } from './libs/google-genai/google-gen-ai.module';

/**
 * Main application module
 * @description Imports all feature modules and global providers
 */
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MailerModule,
    CloudinaryModule,
    GoogleGenAiModule,
    UserModule,
    GreenWasteAiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
