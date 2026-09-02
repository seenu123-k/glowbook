import { Module } from '@nestjs/common';
import { StaffLeaveController } from './staff-leave.controller';
import { StaffLeaveService } from './staff-leave.service';

@Module({
  controllers: [StaffLeaveController],
  providers: [StaffLeaveService]
})
export class StaffLeaveModule {}
