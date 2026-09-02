import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  // =====================================================
  // CUSTOMER: CREATE APPOINTMENT
  // POST /appointments
  // =====================================================

  @Post()
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('CUSTOMER')
  create(
    @Req() request: any,
    @Body()
    createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.create(
      request.user.userId,
      createAppointmentDto,
    );
  }

  // =====================================================
  // CUSTOMER: MY APPOINTMENTS
  // GET /appointments/my
  // =====================================================

  @Get('my')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('CUSTOMER')
  findByCustomer(
    @Req() request: any,
  ) {
    return this.appointmentService.findByCustomer(
      request.user.userId,
    );
  }

  // =====================================================
  // SALON OWNER: SALON APPOINTMENTS
  // GET /appointments/salon/:salonId
  // =====================================================

  @Get('salon/:salonId')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  findBySalon(
    @Param('salonId')
    salonId: string,

    @Req() request: any,
  ) {
    return this.appointmentService.findBySalon(
      salonId,
      request.user.userId,
    );
  }

  // =====================================================
  // GET SINGLE APPOINTMENT
  // GET /appointments/:id
  // CUSTOMER / SALON OWNER
  // =====================================================

  @Get(':id')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    'CUSTOMER',
    'SALON_OWNER',
  )
  findOne(
    @Param('id') id: string,

    @Req() request: any,
  ) {
    return this.appointmentService.findOne(
      id,
      request.user.userId,
    );
  }

  // =====================================================
  // SALON OWNER: CONFIRM
  // PATCH /appointments/:id/confirm
  // =====================================================

  @Patch(':id/confirm')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  confirm(
    @Param('id') id: string,

    @Req() request: any,
  ) {
    return this.appointmentService.confirm(
      id,
      request.user.userId,
    );
  }

  // =====================================================
  // SALON OWNER: COMPLETE
  // PATCH /appointments/:id/complete
  // =====================================================

  @Patch(':id/complete')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  complete(
    @Param('id') id: string,

    @Req() request: any,
  ) {
    return this.appointmentService.complete(
      id,
      request.user.userId,
    );
  }

  // =====================================================
  // CUSTOMER / SALON OWNER: CANCEL
  // PATCH /appointments/:id/cancel
  // =====================================================

  @Patch(':id/cancel')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    'CUSTOMER',
    'SALON_OWNER',
  )
  cancel(
    @Param('id') id: string,

    @Req() request: any,

    @Body()
    body: {
      cancellationReason?: string;
    },
  ) {
    return this.appointmentService.cancel(
      id,
      request.user.userId,
      body?.cancellationReason,
    );
  }
}