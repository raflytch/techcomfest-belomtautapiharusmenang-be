import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';

@Module({
  imports: [],
  controllers: [],
  providers: [OauthService],
  exports: [],
})
export class OauthModule {}
