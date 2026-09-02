import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
  ) {}

  // =====================================================
  // CREATE STAFF
  // POST /staff
  // =====================================================

  @Post()
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  create(
    @Req() request: any,
    @Body()
    createStaffDto: CreateStaffDto,
  ) {
    return this.staffService.create(
      request.user.userId,
      createStaffDto,
    );
  }

  // =====================================================
  // GET ALL STAFF OF LOGGED-IN OWNER
  // GET /staff/my
  // =====================================================

  @Get('my')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  findMyStaff(
    @Req() request: any,
  ) {
    return this.staffService.findMyStaff(
      request.user.userId,
    );
  }

  // =====================================================
  // GET STAFF BY SALON
  // GET /staff/salon/:salonId
  // PUBLIC
  // =====================================================

  @Get('salon/:salonId')
  findBySalon(
    @Param('salonId')
    salonId: string,
  ) {
    return this.staffService.findBySalon(
      salonId,
    );
  }

  // =====================================================
  // GET SINGLE STAFF
  // GET /staff/:id
  // PUBLIC
  // =====================================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.staffService.findOne(id);
  }

  // =====================================================
  // UPDATE STAFF
  // PATCH /staff/:id
  // =====================================================

  @Patch(':id')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  update(
    @Param('id') id: string,

    @Req() request: any,

    @Body()
    createStaffDto: CreateStaffDto,
  ) {
    return this.staffService.update(
      id,
      request.user.userId,
      createStaffDto,
    );
  }

  // =====================================================
  // DEACTIVATE STAFF
  // PATCH /staff/:id/deactivate
  // =====================================================

  @Patch(':id/deactivate')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  deactivate(
    @Param('id') id: string,

    @Req() request: any,
  ) {
    return this.staffService.deactivate(
      id,
      request.user.userId,
    );
  }

  // =====================================================
  // ACTIVATE STAFF
  // PATCH /staff/:id/activate
  // =====================================================

  @Patch(':id/activate')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  activate(
    @Param('id') id: string,

    @Req() request: any,
  ) {
    return this.staffService.activate(
      id,
      request.user.userId,
    );
  }

  // =====================================================
  // DELETE STAFF
  // DELETE /staff/:id
  // =====================================================

  @Delete(':id')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  remove(
    @Param('id') id: string,

    @Req() request: any,
  ) {
    return this.staffService.remove(
      id,
      request.user.userId,
    );
  }
}