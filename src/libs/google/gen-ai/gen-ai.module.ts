import { Module } from '@nestjs/common';
import { GenAiService } from './gen-ai.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GenAiService],
  exports: [],
})
export class GenAiModule {}
