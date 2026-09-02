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

import { StaffLeaveService } from './staff-leave.service';
import { CreateStaffLeaveDto } from './dto/create-staff-leave.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('staff-leaves')
export class StaffLeaveController {
  constructor(
    private readonly staffLeaveService: StaffLeaveService,
  ) {}

  // CREATE STAFF LEAVE
  // POST /staff-leaves
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_OWNER')
  create(
    @Req() request: any,
    @Body() createStaffLeaveDto: CreateStaffLeaveDto,
  ) {
    return this.staffLeaveService.create(
      request.user.userId,
      createStaffLeaveDto,
    );
  }

  // GET STAFF LEAVES
  // GET /staff-leaves/staff/:staffId
  @Get('staff/:staffId')
  findByStaff(@Param('staffId') staffId: string) {
    return this.staffLeaveService.findByStaff(staffId);
  }

  // DELETE STAFF LEAVE
  // DELETE /staff-leaves/:id
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SALON_OWNER')
  remove(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.staffLeaveService.remove(
      id,
      request.user.userId,
    );
  }
}