import { Module } from '@nestjs/common';
import { WorkingHourController } from './working-hour.controller';
import { WorkingHourService } from './working-hour.service';

@Module({
  controllers: [WorkingHourController],
  providers: [WorkingHourService]
})
export class WorkingHourModule {}
