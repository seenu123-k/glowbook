import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return 'Hello World!';
  }

  @Get('health/database')
  getDatabaseStatus() {
    return this.appService.getDatabaseStatus();
  }
}