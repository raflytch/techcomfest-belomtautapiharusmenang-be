import { Injectable } from '@nestjs/common';
import { CreateTwilioDto } from './dto/create-twilio.dto';
import { UpdateTwilioDto } from './dto/update-twilio.dto';

@Injectable()
export class TwilioService {
  create(createTwilioDto: CreateTwilioDto) {
    return 'This action adds a new twilio';
  }

  findAll() {
    return `This action returns all twilios`;
  }

  findOne(id: number) {
    return `This action returns a #id twilio`;
  }

  update(id: number, updateTwilioDto: UpdateTwilioDto) {
    return `This action updates a #id twilio`;
  }

  remove(id: number) {
    return `This action removes a #id twilio`;
  }
}
