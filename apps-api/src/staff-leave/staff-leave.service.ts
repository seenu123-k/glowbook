import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffLeaveDto } from './dto/create-staff-leave.dto';

@Injectable()
export class StaffLeaveService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // CREATE STAFF LEAVE
  // =========================
  async create(
    userId: string,
    createStaffLeaveDto: CreateStaffLeaveDto,
  ) {
    const { staffId, startDate, endDate, reason } =
      createStaffLeaveDto;

    const staff = await this.prisma.staff.findUnique({
      where: {
        id: staffId,
      },
      include: {
        salon: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.salon.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to manage this staff leave',
      );
    }

    const leave = await this.prisma.staffLeave.create({
      data: {
        staffId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'APPROVED',
      },
    });

    return {
      success: true,
      message: 'Staff leave created successfully',
      data: leave,
    };
  }

  // =========================
  // GET STAFF LEAVES
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

    const leaves = await this.prisma.staffLeave.findMany({
      where: {
        staffId,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return {
      success: true,
      data: leaves,
    };
  }

  // =========================
  // DELETE STAFF LEAVE
  // =========================
  async remove(id: string, userId: string) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: {
        id,
      },
      include: {
        staff: {
          include: {
            salon: true,
          },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException('Staff leave not found');
    }

    if (leave.staff.salon.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this leave',
      );
    }

    await this.prisma.staffLeave.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Staff leave deleted successfully',
    };
  }
}