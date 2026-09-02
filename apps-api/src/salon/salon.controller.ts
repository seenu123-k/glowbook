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

import { SalonService } from './salon.service';
import { CreateSalonDto } from './dto/create-salon.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('salons')
export class SalonController {
  constructor(
    private readonly salonService: SalonService,
  ) {}

  // =====================================================
  // CREATE SALON
  // POST /salons
  // ADMIN ONLY
  // =====================================================

  @Post()
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('ADMIN')
  create(
    @Req() request: any,
    @Body()
    createSalonDto: CreateSalonDto,
  ) {
    return this.salonService.create(
      request.user.userId,
      createSalonDto,
    );
  }

  // =====================================================
  // GET MY SALON
  // GET /salons/owner/me
  // SALON OWNER ONLY
  //
  // ONE OWNER = ONE SALON
  // =====================================================

  @Get('owner/me')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('SALON_OWNER')
  findMySalon(
    @Req() request: any,
  ) {
    return this.salonService.findMySalon(
      request.user.userId,
    );
  }

  // =====================================================
  // GET ALL ACTIVE SALONS
  // GET /salons
  // PUBLIC
  // =====================================================

  @Get()
  findAll() {
    return this.salonService.findAll();
  }

  // =====================================================
  // GET SINGLE SALON
  // GET /salons/:id
  // PUBLIC
  // =====================================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.salonService.findOne(id);
  }

  // =====================================================
  // UPDATE SALON
  // PATCH /salons/:id
  // SALON OWNER ONLY
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
    createSalonDto: CreateSalonDto,
  ) {
    return this.salonService.update(
      id,
      request.user.userId,
      createSalonDto,
    );
  }

  // =====================================================
  // DEACTIVATE SALON
  // PATCH /salons/:id/deactivate
  // SALON OWNER ONLY
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
    return this.salonService.deactivate(
      id,
      request.user.userId,
    );
  }
}