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

import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('services')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
  ) {}

  // =====================================================
  // SALON OWNER: CREATE SERVICE
  // POST /services
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
    createServiceDto: CreateServiceDto,
  ) {
    return this.serviceService.create(
      request.user.userId,
      createServiceDto,
    );
  }

  // =====================================================
  // PUBLIC: GET SERVICES BY SALON
  // GET /services/salon/:salonId
  // =====================================================

  @Get('salon/:salonId')
  findBySalon(
    @Param('salonId')
    salonId: string,
  ) {
    return this.serviceService.findBySalon(
      salonId,
    );
  }

  // =====================================================
  // PUBLIC: GET SINGLE SERVICE
  // GET /services/:id
  // =====================================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.serviceService.findOne(id);
  }

  // =====================================================
  // SALON OWNER: UPDATE SERVICE
  // PATCH /services/:id
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
    createServiceDto: CreateServiceDto,
  ) {
    return this.serviceService.update(
      id,
      request.user.userId,
      createServiceDto,
    );
  }

  // =====================================================
  // SALON OWNER: DEACTIVATE SERVICE
  // PATCH /services/:id/deactivate
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
    return this.serviceService.deactivate(
      id,
      request.user.userId,
    );
  }
}