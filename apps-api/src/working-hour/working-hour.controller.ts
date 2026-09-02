import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { WorkingHourService } from './working-hour.service';
import { CreateWorkingHourDto } from './dto/create-working-hour.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('working-hours')
export class WorkingHourController {
  constructor(
    private readonly workingHourService: WorkingHourService,
  ) {}

  // CREATE WORKING HOUR
  // POST /working-hours
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_OWNER')
  create(
    @Req() request: any,
    @Body() createWorkingHourDto: CreateWorkingHourDto,
  ) {
    return this.workingHourService.create(
      request.user.userId,
      createWorkingHourDto,
    );
  }

  // GET SALON WORKING HOURS
  // GET /working-hours/salon/:salonId
  @Get('salon/:salonId')
  findBySalon(@Param('salonId') salonId: string) {
    return this.workingHourService.findBySalon(salonId);
  }

  // GET STAFF WORKING HOURS
  // GET /working-hours/staff/:staffId
  @Get('staff/:staffId')
  findByStaff(@Param('staffId') staffId: string) {
    return this.workingHourService.findByStaff(staffId);
  }

  // DELETE WORKING HOUR
  // DELETE /working-hours/:id
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_OWNER')
  remove(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.workingHourService.remove(
      id,
      request.user.userId,
    );
  }
}