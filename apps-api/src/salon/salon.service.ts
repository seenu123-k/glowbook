import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonDto } from './dto/create-salon.dto';

@Injectable()
export class SalonService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // CREATE SALON
  // POST /salons
  // ADMIN ONLY
  //
  // ONE SALON OWNER = ONE ACTIVE SALON
  // =====================================================

  async create(
    adminId: string,
    createSalonDto: CreateSalonDto,
  ) {
    // ---------------------------------------------------
    // CHECK ADMIN
    // ---------------------------------------------------

    const admin =
      await this.prisma.user.findUnique({
        where: {
          id: adminId,
        },
      });

    if (!admin) {
      throw new NotFoundException(
        'Admin not found',
      );
    }

    if (admin.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admin can create a salon',
      );
    }

    // ---------------------------------------------------
    // CHECK OWNER
    // ---------------------------------------------------

    const owner =
      await this.prisma.user.findUnique({
        where: {
          id: createSalonDto.ownerId,
        },
      });

    if (!owner) {
      throw new NotFoundException(
        'Salon owner not found',
      );
    }

    if (owner.role !== 'SALON_OWNER') {
      throw new ForbiddenException(
        'Selected user is not a salon owner',
      );
    }

    if (owner.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Salon owner is not active',
      );
    }

    // ---------------------------------------------------
    // CHECK WHETHER OWNER ALREADY HAS ACTIVE SALON
    // ONE OWNER = ONE SALON
    // ---------------------------------------------------

    const existingSalon =
      await this.prisma.salon.findFirst({
        where: {
          ownerId: createSalonDto.ownerId,
          status: 'ACTIVE',
        },
      });

    if (existingSalon) {
      throw new ConflictException(
        `This owner already has an active salon: ${existingSalon.name}`,
      );
    }

    // ---------------------------------------------------
    // REMOVE ownerId FROM DTO
    // Prevent duplicate ownerId problem
    // ---------------------------------------------------

    const {
      ownerId: selectedOwnerId,
      name,
      ...salonData
    } = createSalonDto;

    // ---------------------------------------------------
    // VALIDATE NAME
    // ---------------------------------------------------

    if (!name?.trim()) {
      throw new ForbiddenException(
        'Salon name is required',
      );
    }

    // ---------------------------------------------------
    // GENERATE UNIQUE SLUG
    // ---------------------------------------------------

    const slug =
      await this.generateUniqueSlug(
        name,
      );

    // ---------------------------------------------------
    // CREATE SALON
    // ---------------------------------------------------

    const salon =
      await this.prisma.salon.create({
        data: {
          ownerId:
            selectedOwnerId,

          name:
            name.trim(),

          slug,

          ...salonData,
        },

        include: {
          owner: {
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
        'Salon created and assigned to owner successfully',

      data: salon,
    };
  }

  // =====================================================
  // GET ALL ACTIVE SALONS
  // GET /salons
  // PUBLIC
  // =====================================================

  async findAll() {
    const salons =
      await this.prisma.salon.findMany({
        where: {
          status: 'ACTIVE',
        },

        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    return {
      success: true,
      data: salons,
    };
  }

  // =====================================================
  // GET SINGLE SALON
  // GET /salons/:id
  // PUBLIC
  // =====================================================

  async findOne(
    id: string,
  ) {
    const salon =
      await this.prisma.salon.findUnique({
        where: {
          id,
        },

        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          services: {
            where: {
              status: 'ACTIVE',
            },

            include: {
              category: true,
            },

            orderBy: {
              createdAt: 'desc',
            },
          },

          staff: {
            where: {
              status: 'ACTIVE',
            },

            orderBy: {
              createdAt: 'desc',
            },
          },

          workingHours: {
            orderBy: {
              dayOfWeek: 'asc',
            },
          },

          appointments: {
            orderBy: {
              appointmentDate: 'desc',
            },

            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },

              service: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  durationMinutes: true,
                },
              },

              staff: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          reviews: {
            orderBy: {
              createdAt: 'desc',
            },

            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

    if (!salon) {
      throw new NotFoundException(
        'Salon not found',
      );
    }

    return {
      success: true,
      data: salon,
    };
  }

  // =====================================================
  // GET MY SALON
  // GET /salons/owner/me
  // SALON OWNER ONLY
  //
  // ONE OWNER = ONE SALON
  // =====================================================

  async findMySalon(
    userId: string,
  ) {
    // ---------------------------------------------------
    // CHECK OWNER
    // ---------------------------------------------------

    const owner =
      await this.prisma.user.findUnique({
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

    if (!owner) {
      throw new NotFoundException(
        'Owner not found',
      );
    }

    if (owner.role !== 'SALON_OWNER') {
      throw new ForbiddenException(
        'Only salon owners can access this resource',
      );
    }

    // ---------------------------------------------------
    // GET ONE ACTIVE SALON
    // ---------------------------------------------------

    const salon =
      await this.prisma.salon.findFirst({
        where: {
          ownerId: userId,
          status: 'ACTIVE',
        },

        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          services: {
            where: {
              status: 'ACTIVE',
            },

            include: {
              category: true,
            },

            orderBy: {
              createdAt: 'desc',
            },
          },

          staff: {
            where: {
              status: 'ACTIVE',
            },

            orderBy: {
              createdAt: 'desc',
            },
          },

          workingHours: {
            orderBy: {
              dayOfWeek: 'asc',
            },
          },

          appointments: {
            orderBy: {
              appointmentDate: 'desc',
            },

            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },

              service: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  durationMinutes: true,
                },
              },

              staff: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          reviews: {
            orderBy: {
              createdAt: 'desc',
            },

            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

    // ---------------------------------------------------
    // NO SALON
    // ---------------------------------------------------

    if (!salon) {
      throw new NotFoundException(
        'No active salon found for this owner',
      );
    }

    // ---------------------------------------------------
    // RETURN ONE SALON
    // ---------------------------------------------------

    return {
      success: true,
      data: salon,
    };
  }

  // =====================================================
  // UPDATE SALON
  // PATCH /salons/:id
  // SALON OWNER ONLY
  // =====================================================

  async update(
    id: string,
    userId: string,
    createSalonDto: CreateSalonDto,
  ) {
    // ---------------------------------------------------
    // FIND SALON
    // ---------------------------------------------------

    const salon =
      await this.prisma.salon.findUnique({
        where: {
          id,
        },
      });

    if (!salon) {
      throw new NotFoundException(
        'Salon not found',
      );
    }

    // ---------------------------------------------------
    // OWNER CHECK
    // ---------------------------------------------------

    if (
      salon.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this salon',
      );
    }

    // ---------------------------------------------------
    // OWNER ID MUST NOT CHANGE
    // ---------------------------------------------------

    const {
      ownerId,
      name,
      ...salonData
    } = createSalonDto;

    // Avoid unused variable warning
    void ownerId;

    const updateData: Record<
      string,
      any
    > = {
      ...salonData,
    };

    // ---------------------------------------------------
    // UPDATE NAME + SLUG
    // ---------------------------------------------------

    if (
      name &&
      name.trim() !== salon.name
    ) {
      updateData.name =
        name.trim();

      updateData.slug =
        await this.generateUniqueSlug(
          name,
          id,
        );
    }

    // ---------------------------------------------------
    // UPDATE
    // ---------------------------------------------------

    const updatedSalon =
      await this.prisma.salon.update({
        where: {
          id,
        },

        data: updateData,

        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

    return {
      success: true,

      message:
        'Salon updated successfully',

      data: updatedSalon,
    };
  }

  // =====================================================
  // DEACTIVATE SALON
  // PATCH /salons/:id/deactivate
  // SALON OWNER ONLY
  // =====================================================

  async deactivate(
    id: string,
    userId: string,
  ) {
    // ---------------------------------------------------
    // FIND SALON
    // ---------------------------------------------------

    const salon =
      await this.prisma.salon.findUnique({
        where: {
          id,
        },
      });

    if (!salon) {
      throw new NotFoundException(
        'Salon not found',
      );
    }

    // ---------------------------------------------------
    // OWNER CHECK
    // ---------------------------------------------------

    if (
      salon.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to deactivate this salon',
      );
    }

    // ---------------------------------------------------
    // DEACTIVATE
    // ---------------------------------------------------

    const updatedSalon =
      await this.prisma.salon.update({
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
        'Salon deactivated successfully',

      data: updatedSalon,
    };
  }

  // =====================================================
  // GENERATE UNIQUE SLUG
  // =====================================================

  private async generateUniqueSlug(
    name: string,
    excludeId?: string,
  ): Promise<string> {
    const baseSlug =
      name
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9]+/g,
          '-',
        )
        .replace(
          /^-+|-+$/g,
          '',
        );

    const safeBaseSlug =
      baseSlug ||
      `salon-${Date.now()}`;

    let slug =
      safeBaseSlug;

    let counter = 1;

    // ---------------------------------------------------
    // CHECK DUPLICATE SLUG
    // ---------------------------------------------------

    while (true) {
      const existingSalon =
        await this.prisma.salon.findFirst({
          where: {
            slug,

            ...(excludeId
              ? {
                  NOT: {
                    id: excludeId,
                  },
                }
              : {}),
          },
        });

      if (!existingSalon) {
        return slug;
      }

      slug =
        `${safeBaseSlug}-${counter}`;

      counter++;
    }
  }
}