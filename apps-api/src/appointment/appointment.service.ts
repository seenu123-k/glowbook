import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // CREATE APPOINTMENT
  // =====================================================

  async create(
    customerId: string,
    createAppointmentDto: CreateAppointmentDto,
  ) {
    const {
      salonId,
      serviceId,
      staffId,
      appointmentDate,
      startTime,
      endTime,
      notes,
    } = createAppointmentDto;

    // ===================================================
    // CHECK SALON
    // ===================================================

    const salon =
      await this.prisma.salon.findUnique({
        where: {
          id: salonId,
        },
      });

    if (
      !salon ||
      salon.status !== 'ACTIVE'
    ) {
      throw new NotFoundException(
        'Salon not found or inactive',
      );
    }

    // ===================================================
    // CHECK SERVICE
    // ===================================================

    const service =
      await this.prisma.service.findFirst({
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

    // ===================================================
    // CHECK STAFF
    // ===================================================

    const staff =
      await this.prisma.staff.findFirst({
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

    // ===================================================
    // DATE VALIDATION
    // ===================================================

    const appointmentDateValue =
      new Date(appointmentDate);

    const startTimeValue =
      new Date(startTime);

    const endTimeValue =
      new Date(endTime);

    if (
      Number.isNaN(
        appointmentDateValue.getTime(),
      ) ||
      Number.isNaN(
        startTimeValue.getTime(),
      ) ||
      Number.isNaN(
        endTimeValue.getTime(),
      )
    ) {
      throw new ConflictException(
        'Invalid appointment date or time',
      );
    }

    // ===================================================
    // END TIME CHECK
    // ===================================================

    if (
      endTimeValue <= startTimeValue
    ) {
      throw new ConflictException(
        'End time must be after start time',
      );
    }

    // ===================================================
    // MAKE SURE START/END BELONG TO SAME DATE
    // ===================================================

    const appointmentDay =
      appointmentDateValue
        .toISOString()
        .slice(0, 10);

    const startDay =
      startTimeValue
        .toISOString()
        .slice(0, 10);

    const endDay =
      endTimeValue
        .toISOString()
        .slice(0, 10);

    if (
      appointmentDay !== startDay ||
      appointmentDay !== endDay
    ) {
      throw new ConflictException(
        'Appointment date and time do not match',
      );
    }

    // ===================================================
    // CHECK STAFF LEAVE
    // ===================================================

    const staffLeave =
      await this.prisma.staffLeave.findFirst({
        where: {
          staffId,

          status: 'APPROVED',

          startDate: {
            lte: appointmentDateValue,
          },

          endDate: {
            gte: appointmentDateValue,
          },
        },
      });

    if (staffLeave) {
      throw new ConflictException(
        'Staff is on leave on this date',
      );
    }

    // ===================================================
    // CHECK WORKING HOURS
    // ===================================================

    /*
     * IMPORTANT:
     *
     * getUTCDay():
     *
     * Sunday    = 0
     * Monday    = 1
     * Tuesday   = 2
     * Wednesday = 3
     * Thursday  = 4
     * Friday    = 5
     * Saturday  = 6
     */

    const dayOfWeek =
      appointmentDateValue.getUTCDay();

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
      throw new ConflictException(
        'Staff is not available on this day',
      );
    }

    // ===================================================
    // CONVERT TIME TO MINUTES
    // ===================================================

    const requestedStart =
      this.getMinutes(
        startTimeValue,
      );

    const requestedEnd =
      this.getMinutes(
        endTimeValue,
      );

    const workingStart =
      this.parseTime(
        workingHour.startTime,
      );

    const workingEnd =
      this.parseTime(
        workingHour.endTime,
      );

    // ===================================================
    // CHECK WORKING HOURS
    // ===================================================

    if (
      requestedStart < workingStart ||
      requestedEnd > workingEnd
    ) {
      throw new ConflictException(
        `Appointment time must be between ${workingHour.startTime} and ${workingHour.endTime}`,
      );
    }

    // ===================================================
    // CHECK DOUBLE BOOKING
    // ===================================================

    const overlappingAppointment =
      await this.prisma.appointment.findFirst({
        where: {
          staffId,

          appointmentDate:
            appointmentDateValue,

          status: {
            in: [
              'PENDING',
              'CONFIRMED',
            ],
          },

          startTime: {
            lt: endTimeValue,
          },

          endTime: {
            gt: startTimeValue,
          },
        },
      });

    if (overlappingAppointment) {
      throw new ConflictException(
        'Staff is already booked for this time',
      );
    }

    // ===================================================
    // CREATE APPOINTMENT
    // ===================================================

    const appointment =
      await this.prisma.appointment.create({
        data: {
          customerId,

          salonId,

          serviceId,

          staffId,

          appointmentDate:
            appointmentDateValue,

          startTime:
            startTimeValue,

          endTime:
            endTimeValue,

          price: service.price,

          notes,

          status: 'PENDING',
        },

        include: {
          customer: true,

          salon: true,

          service: true,

          staff: true,
        },
      });

    // ===================================================
    // RESPONSE
    // ===================================================

    return {
      success: true,

      message:
        'Appointment created successfully',

      data: appointment,
    };
  }

  // =====================================================
  // CUSTOMER APPOINTMENTS
  // =====================================================

  async findByCustomer(
    customerId: string,
  ) {
    const appointments =
      await this.prisma.appointment.findMany({
        where: {
          customerId,
        },

        include: {
          customer: true,

          salon: true,

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

  // =====================================================
  // SALON OWNER APPOINTMENTS
  // =====================================================

  async findBySalon(
    salonId: string,
    userId: string,
  ) {
    const salon =
      await this.prisma.salon.findUnique({
        where: {
          id: salonId,
        },
      });

    if (!salon) {
      throw new NotFoundException(
        'Salon not found',
      );
    }

    // ===================================================
    // OWNER CHECK
    // ===================================================

    if (
      salon.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view these appointments',
      );
    }

    // ===================================================
    // GET APPOINTMENTS
    // ===================================================

    const appointments =
      await this.prisma.appointment.findMany({
        where: {
          salonId,
        },

        include: {
          customer: true,

          salon: true,

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

  // =====================================================
  // SINGLE APPOINTMENT
  // =====================================================

  async findOne(
    id: string,
    userId: string,
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id,
        },

        include: {
          customer: true,

          salon: true,

          service: true,

          staff: true,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found',
      );
    }

    // ===================================================
    // CUSTOMER OR OWNER
    // ===================================================

    if (
      appointment.customerId !==
        userId &&
      appointment.salon.ownerId !==
        userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this appointment',
      );
    }

    return {
      success: true,

      data: appointment,
    };
  }

  // =====================================================
  // CONFIRM APPOINTMENT
  // =====================================================

  async confirm(
    id: string,
    userId: string,
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id,
        },

        include: {
          salon: true,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found',
      );
    }

    // ===================================================
    // OWNER CHECK
    // ===================================================

    if (
      appointment.salon.ownerId !==
      userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to confirm this appointment',
      );
    }

    // ===================================================
    // STATUS CHECK
    // ===================================================

    if (
      appointment.status !==
      'PENDING'
    ) {
      throw new ConflictException(
        'Only pending appointments can be confirmed',
      );
    }

    // ===================================================
    // UPDATE
    // ===================================================

    const updatedAppointment =
      await this.prisma.appointment.update({
        where: {
          id,
        },

        data: {
          status: 'CONFIRMED',
        },
      });

    return {
      success: true,

      message:
        'Appointment confirmed successfully',

      data: updatedAppointment,
    };
  }

  // =====================================================
  // COMPLETE APPOINTMENT
  // =====================================================

  async complete(
    id: string,
    userId: string,
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id,
        },

        include: {
          salon: true,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found',
      );
    }

    // ===================================================
    // OWNER CHECK
    // ===================================================

    if (
      appointment.salon.ownerId !==
      userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to complete this appointment',
      );
    }

    // ===================================================
    // STATUS CHECK
    // ===================================================

    if (
      appointment.status !==
      'CONFIRMED'
    ) {
      throw new ConflictException(
        'Only confirmed appointments can be completed',
      );
    }

    // ===================================================
    // UPDATE
    // ===================================================

    const updatedAppointment =
      await this.prisma.appointment.update({
        where: {
          id,
        },

        data: {
          status: 'COMPLETED',
        },
      });

    return {
      success: true,

      message:
        'Appointment completed successfully',

      data: updatedAppointment,
    };
  }

  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

  async cancel(
    id: string,
    userId: string,
    cancellationReason?: string,
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id,
        },

        include: {
          salon: true,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found',
      );
    }

    // ===================================================
    // CUSTOMER OR OWNER
    // ===================================================

    if (
      appointment.customerId !==
        userId &&
      appointment.salon.ownerId !==
        userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to cancel this appointment',
      );
    }

    // ===================================================
    // STATUS CHECK
    // ===================================================

    if (
      appointment.status ===
        'COMPLETED' ||
      appointment.status ===
        'CANCELLED'
    ) {
      throw new ConflictException(
        'Appointment cannot be cancelled',
      );
    }

    // ===================================================
    // UPDATE
    // ===================================================

    const updatedAppointment =
      await this.prisma.appointment.update({
        where: {
          id,
        },

        data: {
          status: 'CANCELLED',

          cancellationReason,
        },
      });

    return {
      success: true,

      message:
        'Appointment cancelled successfully',

      data: updatedAppointment,
    };
  }

  // =====================================================
  // HELPER - DATE TO MINUTES
  // =====================================================

  private getMinutes(
    date: Date,
  ): number {
    return (
      date.getUTCHours() * 60 +
      date.getUTCMinutes()
    );
  }

  // =====================================================
  // HELPER - "09:00" -> 540
  // =====================================================

  private parseTime(
    time: string,
  ): number {
    const [
      hours,
      minutes,
    ] = time
      .split(':')
      .map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      throw new ConflictException(
        'Invalid working hour format',
      );
    }

    return (
      hours * 60 + minutes
    );
  }
}