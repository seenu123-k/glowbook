import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // GET AVAILABLE SLOTS
  // GET /availability
  // =========================
  async getAvailableSlots(
    salonId: string,
    staffId: string,
    serviceId: string,
    date: string,
  ) {
    // =========================
    // CHECK SALON
    // =========================
    const salon = await this.prisma.salon.findUnique({
      where: {
        id: salonId,
      },
    });

    if (!salon || salon.status !== 'ACTIVE') {
      throw new NotFoundException(
        'Salon not found or inactive',
      );
    }

    // =========================
    // CHECK SERVICE
    // =========================
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        salonId,
        status: 'ACTIVE',
      },
    });

    if (!service) {
      throw new NotFoundException(
        'Service not found in this salon',
      );
    }

    // =========================
    // CHECK STAFF
    // =========================
    const staff = await this.prisma.staff.findFirst({
      where: {
        id: staffId,
        salonId,
        status: 'ACTIVE',
      },
    });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found in this salon',
      );
    }

    const requestedDate = new Date(date);

    if (Number.isNaN(requestedDate.getTime())) {
      throw new ConflictException(
        'Invalid date',
      );
    }

    // =========================
    // GET DAY OF WEEK
    // =========================
    const dayOfWeek = requestedDate.getDay();

    // =========================
    // CHECK WORKING HOURS
    // =========================
    const workingHour =
      await this.prisma.workingHour.findFirst({
        where: {
          salonId,
          staffId,
          dayOfWeek,
          isAvailable: true,
        },
      });

    if (!workingHour) {
      return {
        success: true,
        message: 'Staff is not available on this day',
        data: [],
      };
    }

    // =========================
    // CHECK STAFF LEAVE
    // =========================
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const staffLeave =
      await this.prisma.staffLeave.findFirst({
        where: {
          staffId,
          status: 'APPROVED',
          startDate: {
            lte: endOfDay,
          },
          endDate: {
            gte: startOfDay,
          },
        },
      });

    if (staffLeave) {
      return {
        success: true,
        message: 'Staff is on leave on this date',
        data: [],
      };
    }

    // =========================
    // GET EXISTING APPOINTMENTS
    // =========================
    const appointments =
      await this.prisma.appointment.findMany({
        where: {
          salonId,
          staffId,
          appointmentDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });

    // =========================
    // GENERATE SLOTS
    // =========================
    const serviceDuration =
      service.durationMinutes;

    const workingStart =
      this.parseTime(workingHour.startTime);

    const workingEnd =
      this.parseTime(workingHour.endTime);

    const slots: {
      startTime: string;
      endTime: string;
      available: boolean;
    }[] = [];

    const slotInterval = serviceDuration;

    for (
      let minutes = workingStart;
      minutes + serviceDuration <= workingEnd;
      minutes += slotInterval
    ) {
      const slotStart = minutes;
      const slotEnd = minutes + serviceDuration;

      const isBooked = appointments.some(
        (appointment) => {
          const appointmentStart =
            this.getMinutes(
              new Date(appointment.startTime),
            );

          const appointmentEnd =
            this.getMinutes(
              new Date(appointment.endTime),
            );

          return (
            slotStart < appointmentEnd &&
            slotEnd > appointmentStart
          );
        },
      );

      slots.push({
        startTime: this.formatTime(slotStart),
        endTime: this.formatTime(slotEnd),
        available: !isBooked,
      });
    }

    return {
      success: true,
      message: 'Available slots fetched successfully',
      data: {
        date,
        salonId,
        staffId,
        serviceId,
        serviceDuration,
        workingHours: {
          startTime: workingHour.startTime,
          endTime: workingHour.endTime,
        },
        slots,
      },
    };
  }

  // =========================
  // HELPERS
  // =========================

  private parseTime(time: string): number {
    const [hours, minutes] =
      time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  private getMinutes(date: Date): number {
    return (
      date.getHours() * 60 +
      date.getMinutes()
    );
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours
      .toString()
      .padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }
}