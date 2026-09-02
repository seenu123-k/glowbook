import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ManagerService } from './manager.service';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('manager')
export class ManagerController {
  constructor(
    private readonly managerService: ManagerService,
  ) {}

  // =========================
  // GET MANAGER PROFILE
  // GET /manager/profile
  // =========================
  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_MANAGER')
  getProfile(@Req() request: any) {
    return this.managerService.getProfile(
      request.user.userId,
    );
  }

  // =========================
  // GET MY SALONS
  // GET /manager/salons
  // =========================
  @Get('salons')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_MANAGER')
  getMySalons(@Req() request: any) {
    return this.managerService.getMySalons(
      request.user.userId,
    );
  }

  // =========================
  // GET SALON APPOINTMENTS
  // GET /manager/salons/:salonId/appointments
  // =========================
  @Get('salons/:salonId/appointments')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_MANAGER')
  getAppointments(
    @Req() request: any,
    @Param('salonId') salonId: string,
  ) {
    return this.managerService.getAppointments(
      request.user.userId,
      salonId,
    );
  }

  // =========================
  // GET SALON STAFF
  // GET /manager/salons/:salonId/staff
  // =========================
  @Get('salons/:salonId/staff')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_MANAGER')
  getStaff(
    @Req() request: any,
    @Param('salonId') salonId: string,
  ) {
    return this.managerService.getStaff(
      request.user.userId,
      salonId,
    );
  }

  // =========================
  // GET SALON SERVICES
  // GET /manager/salons/:salonId/services
  // =========================
  @Get('salons/:salonId/services')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_MANAGER')
  getServices(
    @Req() request: any,
    @Param('salonId') salonId: string,
  ) {
    return this.managerService.getServices(
      request.user.userId,
      salonId,
    );
  }
}