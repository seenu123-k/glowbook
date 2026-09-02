import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // GET OWNER'S SALON
  // ONE OWNER = ONE SALON
  // =====================================================

  private async getOwnerSalon(
    userId: string,
  ) {
    const salon =
      await this.prisma.salon.findFirst({
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

    return salon;
  }

  // =====================================================
  // CREATE STAFF
  // POST /staff
  // SALON OWNER ONLY
  // =====================================================

  async create(
    userId: string,
    createStaffDto: CreateStaffDto,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    // ---------------------------------------------------
    // VERIFY STAFF USER
    // ---------------------------------------------------

    if (createStaffDto.userId) {
      const user =
        await this.prisma.user.findUnique({
          where: {
            id: createStaffDto.userId,
          },
        });

      if (!user) {
        throw new NotFoundException(
          'Staff user not found',
        );
      }

      if (user.role !== 'STAFF') {
        throw new ForbiddenException(
          'Selected user must have STAFF role',
        );
      }

      if (user.status !== 'ACTIVE') {
        throw new ForbiddenException(
          'Selected staff user is not active',
        );
      }
    }

    // ---------------------------------------------------
    // CREATE STAFF IN OWNER'S SALON
    // ---------------------------------------------------

    const staff =
      await this.prisma.staff.create({
        data: {
          salonId: salon.id,

          name:
            createStaffDto.name,

          bio:
            createStaffDto.bio,

          specialization:
            createStaffDto.specialization,

          profileImage:
            createStaffDto.profileImage,

          experienceYears:
            createStaffDto.experienceYears ?? 0,

          userId:
            createStaffDto.userId,
        },

        include: {
          salon: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        'Staff created successfully',
      data: staff,
    };
  }

  // =====================================================
  // GET MY STAFF
  // GET /staff/my
  // SALON OWNER ONLY
  // =====================================================

  async findMyStaff(
    userId: string,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    const staff =
      await this.prisma.staff.findMany({
        where: {
          salonId: salon.id,
        },

        include: {
          salon: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
            },
          },
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

  // =====================================================
  // GET STAFF BY SALON
  // GET /staff/salon/:salonId
  // PUBLIC
  // =====================================================

  async findBySalon(
    salonId: string,
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

    const staff =
      await this.prisma.staff.findMany({
        where: {
          salonId,
          status: 'ACTIVE',
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
            },
          },
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

  // =====================================================
  // GET SINGLE STAFF
  // GET /staff/:id
  // =====================================================

  async findOne(
    id: string,
  ) {
    const staff =
      await this.prisma.staff.findUnique({
        where: {
          id,
        },

        include: {
          salon: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
            },
          },
        },
      });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found',
      );
    }

    return {
      success: true,
      data: staff,
    };
  }

  // =====================================================
  // UPDATE STAFF
  // PATCH /staff/:id
  // SALON OWNER ONLY
  // =====================================================

  async update(
    id: string,
    userId: string,
    createStaffDto: CreateStaffDto,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    const staff =
      await this.prisma.staff.findUnique({
        where: {
          id,
        },
      });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found',
      );
    }

    // ---------------------------------------------------
    // STAFF MUST BELONG TO OWNER'S SALON
    // ---------------------------------------------------

    if (
      staff.salonId !== salon.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this staff',
      );
    }

    // ---------------------------------------------------
    // VERIFY USER
    // ---------------------------------------------------

    if (createStaffDto.userId) {
      const user =
        await this.prisma.user.findUnique({
          where: {
            id: createStaffDto.userId,
          },
        });

      if (!user) {
        throw new NotFoundException(
          'Staff user not found',
        );
      }

      if (user.role !== 'STAFF') {
        throw new ForbiddenException(
          'Selected user must have STAFF role',
        );
      }
    }

    // ---------------------------------------------------
    // UPDATE
    // ---------------------------------------------------

    const updatedStaff =
      await this.prisma.staff.update({
        where: {
          id,
        },

        data: {
          ...(createStaffDto.name !==
          undefined
            ? {
                name:
                  createStaffDto.name,
              }
            : {}),

          ...(createStaffDto.bio !==
          undefined
            ? {
                bio:
                  createStaffDto.bio,
              }
            : {}),

          ...(createStaffDto.specialization !==
          undefined
            ? {
                specialization:
                  createStaffDto.specialization,
              }
            : {}),

          ...(createStaffDto.profileImage !==
          undefined
            ? {
                profileImage:
                  createStaffDto.profileImage,
              }
            : {}),

          ...(createStaffDto.experienceYears !==
          undefined
            ? {
                experienceYears:
                  createStaffDto.experienceYears,
              }
            : {}),

          ...(createStaffDto.userId !==
          undefined
            ? {
                userId:
                  createStaffDto.userId,
              }
            : {}),
        },

        include: {
          salon: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        'Staff updated successfully',
      data: updatedStaff,
    };
  }

  // =====================================================
  // DEACTIVATE STAFF
  // PATCH /staff/:id/deactivate
  // =====================================================

  async deactivate(
    id: string,
    userId: string,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    const staff =
      await this.prisma.staff.findUnique({
        where: {
          id,
        },
      });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found',
      );
    }

    if (
      staff.salonId !== salon.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to deactivate this staff',
      );
    }

    const updatedStaff =
      await this.prisma.staff.update({
        where: {
          id,
        },

        data: {
          status: 'INACTIVE',
        },
      });

    return {
      success: true,
      message:
        'Staff deactivated successfully',
      data: updatedStaff,
    };
  }

  // =====================================================
  // ACTIVATE STAFF
  // PATCH /staff/:id/activate
  // =====================================================

  async activate(
    id: string,
    userId: string,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    const staff =
      await this.prisma.staff.findUnique({
        where: {
          id,
        },
      });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found',
      );
    }

    if (
      staff.salonId !== salon.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to activate this staff',
      );
    }

    const updatedStaff =
      await this.prisma.staff.update({
        where: {
          id,
        },

        data: {
          status: 'ACTIVE',
        },
      });

    return {
      success: true,
      message:
        'Staff activated successfully',
      data: updatedStaff,
    };
  }

  // =====================================================
  // DELETE STAFF
  // DELETE /staff/:id
  // =====================================================

  async remove(
    id: string,
    userId: string,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    const staff =
      await this.prisma.staff.findUnique({
        where: {
          id,
        },
      });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found',
      );
    }

    if (
      staff.salonId !== salon.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this staff',
      );
    }

    await this.prisma.staff.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message:
        'Staff deleted successfully',
    };
  }
}