import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  // =========================
  // GET AVAILABLE SLOTS
  // GET /availability
  // =========================
  @Get()
  getAvailableSlots(
    @Query('salonId') salonId: string,
    @Query('staffId') staffId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.availabilityService.getAvailableSlots(
      salonId,
      staffId,
      serviceId,
      date,
    );
  }
}