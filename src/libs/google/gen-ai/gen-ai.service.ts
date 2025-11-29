import { Injectable } from '@nestjs/common';
import { CreateGenAiDto } from './dto/create-gen-ai.dto';
import { UpdateGenAiDto } from './dto/update-gen-ai.dto';

@Injectable()
export class GenAiService {
  create(createGenAiDto: CreateGenAiDto) {
    return 'This action adds a new gen-ai';
  }

  findAll() {
    return `This action returns all gen-ais`;
  }

  findOne(id: number) {
    return `This action returns a #id gen-ai`;
  }

  update(id: number, updateGenAiDto: UpdateGenAiDto) {
    return `This action updates a #id gen-ai`;
  }

  remove(id: number) {
    return `This action removes a #id gen-ai`;
  }
}
