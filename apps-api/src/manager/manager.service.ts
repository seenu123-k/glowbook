import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // GET MY MANAGED SALONS
  // =========================
  async getMySalons(userId: string) {
    const salons = await this.prisma.salon.findMany({
      where: {
        managerId: userId,
      },
      include: {
        services: true,
        staff: true,
      },
    });

    return {
      success: true,
      data: salons,
    };
  }

  // =========================
  // GET SALON APPOINTMENTS
  // =========================
  async getAppointments(
    userId: string,
    salonId: string,
  ) {
    const salon = await this.prisma.salon.findFirst({
      where: {
        id: salonId,
        managerId: userId,
      },
    });

    if (!salon) {
      throw new ForbiddenException(
        'You do not manage this salon',
      );
    }

    const appointments =
      await this.prisma.appointment.findMany({
        where: {
          salonId,
        },
        include: {
          customer: true,
          service: true,
          staff: true,
        },
        orderBy: {
          appointmentDate: 'desc',
        },
      });

    return {
      success: true,
      data: appointments,
    };
  }

  // =========================
  // GET SALON STAFF
  // =========================
  async getStaff(
    userId: string,
    salonId: string,
  ) {
    const salon = await this.prisma.salon.findFirst({
      where: {
        id: salonId,
        managerId: userId,
      },
    });

    if (!salon) {
      throw new ForbiddenException(
        'You do not manage this salon',
      );
    }

    const staff = await this.prisma.staff.findMany({
      where: {
        salonId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: staff,
    };
  }

  // =========================
  // GET SALON SERVICES
  // =========================
  async getServices(
    userId: string,
    salonId: string,
  ) {
    const salon = await this.prisma.salon.findFirst({
      where: {
        id: salonId,
        managerId: userId,
      },
    });

    if (!salon) {
      throw new ForbiddenException(
        'You do not manage this salon',
      );
    }

    const services =
      await this.prisma.service.findMany({
        where: {
          salonId,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return {
      success: true,
      data: services,
    };
  }

  // =========================
  // GET MANAGER PROFILE
  // =========================
  async getProfile(userId: string) {
    const manager = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    if (!manager) {
      throw new NotFoundException(
        'Manager not found',
      );
    }

    return {
      success: true,
      data: manager,
    };
  }
}