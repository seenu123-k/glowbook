import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SalonModule } from './salon/salon.module';
import { ServiceModule } from './service/service.module';
import { CategoryModule } from './category/category.module';
import { StaffModule } from './staff/staff.module';
import { WorkingHourModule } from './working-hour/working-hour.module';
import { StaffLeaveModule } from './staff-leave/staff-leave.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ReviewModule } from './review/review.module';
import { ManagerModule } from './manager/manager.module';
import { AdminModule } from './admin/admin.module';
import { AvailabilityModule } from './availability/availability.module';

@Module({
  imports: [PrismaModule, AuthModule, SalonModule, ServiceModule, CategoryModule, StaffModule, WorkingHourModule, StaffLeaveModule, AppointmentModule, ReviewModule, ManagerModule, AdminModule, AvailabilityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}