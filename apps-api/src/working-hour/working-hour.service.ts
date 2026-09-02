import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkingHourDto } from './dto/create-working-hour.dto';

@Injectable()
export class WorkingHourService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // CREATE WORKING HOUR
  // =========================
  async create(
    userId: string,
    createWorkingHourDto: CreateWorkingHourDto,
  ) {
    const { staffId, dayOfWeek, startTime, endTime, isAvailable } =
      createWorkingHourDto;

    // Find salon owned by logged-in owner
    const salon = await this.prisma.salon.findFirst({
      where: {
        ownerId: userId,
        status: 'ACTIVE',
      },
    });

    if (!salon) {
      throw new NotFoundException(
        'Active salon not found for this owner',
      );
    }

    // If staffId is provided, verify staff belongs to this salon
    if (staffId) {
      const staff = await this.prisma.staff.findFirst({
        where: {
          id: staffId,
          salonId: salon.id,
          status: 'ACTIVE',
        },
      });

      if (!staff) {
        throw new NotFoundException(
          'Staff not found in your salon',
        );
      }
    }

    const workingHour = await this.prisma.workingHour.create({
      data: {
        salonId: salon.id,
        staffId: staffId ?? null,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable ?? true,
      },
    });

    return {
      success: true,
      message: 'Working hour created successfully',
      data: workingHour,
    };
  }

  // =========================
  // GET SALON WORKING HOURS
  // =========================
  async findBySalon(salonId: string) {
    const salon = await this.prisma.salon.findUnique({
      where: {
        id: salonId,
      },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    const workingHours = await this.prisma.workingHour.findMany({
      where: {
        salonId,
      },
      include: {
        staff: true,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return {
      success: true,
      data: workingHours,
    };
  }

  // =========================
  // GET STAFF WORKING HOURS
  // =========================
  async findByStaff(staffId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: {
        id: staffId,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    const workingHours = await this.prisma.workingHour.findMany({
      where: {
        staffId,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return {
      success: true,
      data: workingHours,
    };
  }

  // =========================
  // DELETE WORKING HOUR
  // =========================
  async remove(id: string, userId: string) {
    const workingHour = await this.prisma.workingHour.findUnique({
      where: {
        id,
      },
      include: {
        salon: true,
      },
    });

    if (!workingHour) {
      throw new NotFoundException('Working hour not found');
    }

    if (workingHour.salon.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this working hour',
      );
    }

    await this.prisma.workingHour.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Working hour deleted successfully',
    };
  }
}