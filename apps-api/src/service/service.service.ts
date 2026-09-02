import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // GET OWNER'S ACTIVE SALON
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
  // SALON OWNER: CREATE SERVICE
  // POST /services
  // =====================================================

  async create(
    userId: string,
    createServiceDto: CreateServiceDto,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    const {
      categoryId,
      ...serviceData
    } = createServiceDto;

    // ---------------------------------------------------
    // CHECK CATEGORY
    // ---------------------------------------------------

    const category =
      await this.prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    if (!category.status) {
      throw new ConflictException(
        'Category is inactive',
      );
    }

    // ---------------------------------------------------
    // CREATE SERVICE IN OWNER'S SALON
    // ---------------------------------------------------

    const service =
      await this.prisma.service.create({
        data: {
          salonId:
            salon.id,

          categoryId,

          ...serviceData,
        },

        include: {
          category: true,

          salon: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        'Service created successfully',
      data: service,
    };
  }

  // =====================================================
  // GET SERVICES BY SALON
  // GET /services/salon/:salonId
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

    const services =
      await this.prisma.service.findMany({
        where: {
          salonId,
          status: 'ACTIVE',
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

  // =====================================================
  // GET SINGLE SERVICE
  // GET /services/:id
  // =====================================================

  async findOne(
    id: string,
  ) {
    const service =
      await this.prisma.service.findUnique({
        where: {
          id,
        },

        include: {
          category: true,

          salon: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
        },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    return {
      success: true,
      data: service,
    };
  }

  // =====================================================
  // SALON OWNER: UPDATE SERVICE
  // PATCH /services/:id
  // =====================================================

  async update(
    id: string,
    userId: string,
    createServiceDto: CreateServiceDto,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    const service =
      await this.prisma.service.findUnique({
        where: {
          id,
        },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    // ---------------------------------------------------
    // SERVICE MUST BELONG TO OWNER'S SALON
    // ---------------------------------------------------

    if (
      service.salonId !== salon.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this service',
      );
    }

    // ---------------------------------------------------
    // CHECK CATEGORY
    // ---------------------------------------------------

    const category =
      await this.prisma.category.findUnique({
        where: {
          id:
            createServiceDto.categoryId,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    if (!category.status) {
      throw new ConflictException(
        'Category is inactive',
      );
    }

    // ---------------------------------------------------
    // UPDATE
    // ---------------------------------------------------

    const updatedService =
      await this.prisma.service.update({
        where: {
          id,
        },

        data: {
          categoryId:
            createServiceDto.categoryId,

          name:
            createServiceDto.name,

          description:
            createServiceDto.description,

          price:
            createServiceDto.price,

          durationMinutes:
            createServiceDto.durationMinutes,

          image:
            createServiceDto.image,
        },

        include: {
          category: true,

          salon: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        'Service updated successfully',
      data: updatedService,
    };
  }

  // =====================================================
  // SALON OWNER: DEACTIVATE SERVICE
  // PATCH /services/:id/deactivate
  // =====================================================

  async deactivate(
    id: string,
    userId: string,
  ) {
    const salon =
      await this.getOwnerSalon(userId);

    const service =
      await this.prisma.service.findUnique({
        where: {
          id,
        },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    if (
      service.salonId !== salon.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to deactivate this service',
      );
    }

    const updatedService =
      await this.prisma.service.update({
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
        'Service deactivated successfully',
      data: updatedService,
    };
  }

  // =====================================================
  // ADMIN: GET ALL SERVICES
  // GET /admin/services
  // =====================================================

  async adminFindAll() {
    const services =
      await this.prisma.service.findMany({
        include: {
          category: true,

          salon: {
            select: {
              id: true,
              name: true,
              city: true,
              status: true,

              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
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

  // =====================================================
  // ADMIN: CREATE SERVICE
  // POST /admin/services
  // =====================================================

  async adminCreate(
    data: {
      salonId: string;
      categoryId: string;
      name: string;
      description?: string;
      price: number;
      durationMinutes: number;
      image?: string;
    },
  ) {
    const salon =
      await this.prisma.salon.findUnique({
        where: {
          id: data.salonId,
        },
      });

    if (!salon) {
      throw new NotFoundException(
        'Salon not found',
      );
    }

    const category =
      await this.prisma.category.findUnique({
        where: {
          id: data.categoryId,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    if (!category.status) {
      throw new ConflictException(
        'Category is inactive',
      );
    }

    const service =
      await this.prisma.service.create({
        data: {
          salonId:
            data.salonId,

          categoryId:
            data.categoryId,

          name:
            data.name,

          description:
            data.description,

          price:
            data.price,

          durationMinutes:
            data.durationMinutes,

          image:
            data.image,
        },

        include: {
          category: true,

          salon: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        'Service created successfully',
      data: service,
    };
  }

  // =====================================================
  // ADMIN: UPDATE SERVICE
  // PATCH /admin/services/:id
  // =====================================================

  async adminUpdate(
    id: string,
    data: {
      salonId?: string;
      categoryId?: string;
      name?: string;
      description?: string;
      price?: number;
      durationMinutes?: number;
      image?: string;
    },
  ) {
    const service =
      await this.prisma.service.findUnique({
        where: {
          id,
        },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    // ---------------------------------------------------
    // CHECK SALON
    // ---------------------------------------------------

    if (data.salonId) {
      const salon =
        await this.prisma.salon.findUnique({
          where: {
            id: data.salonId,
          },
        });

      if (!salon) {
        throw new NotFoundException(
          'Salon not found',
        );
      }
    }

    // ---------------------------------------------------
    // CHECK CATEGORY
    // ---------------------------------------------------

    if (data.categoryId) {
      const category =
        await this.prisma.category.findUnique({
          where: {
            id: data.categoryId,
          },
        });

      if (!category) {
        throw new NotFoundException(
          'Category not found',
        );
      }

      if (!category.status) {
        throw new ConflictException(
          'Category is inactive',
        );
      }
    }

    // ---------------------------------------------------
    // UPDATE
    // ---------------------------------------------------

    const updatedService =
      await this.prisma.service.update({
        where: {
          id,
        },

        data,

        include: {
          category: true,

          salon: {
            select: {
              id: true,
              name: true,
              city: true,
              status: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        'Service updated successfully',
      data: updatedService,
    };
  }

  // =====================================================
  // ADMIN: UPDATE SERVICE STATUS
  // PATCH /admin/services/:id/status
  // =====================================================

  async adminUpdateStatus(
    id: string,
    status:
      | 'ACTIVE'
      | 'INACTIVE',
  ) {
    const service =
      await this.prisma.service.findUnique({
        where: {
          id,
        },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    const updatedService =
      await this.prisma.service.update({
        where: {
          id,
        },

        data: {
          status,
        },
      });

    return {
      success: true,
      message:
        'Service status updated successfully',
      data: updatedService,
    };
  }

  // =====================================================
  // ADMIN: DELETE SERVICE
  // DELETE /admin/services/:id
  // =====================================================

  async adminDelete(
    id: string,
  ) {
    const service =
      await this.prisma.service.findUnique({
        where: {
          id,
        },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    // Delete related appointments first
    await this.prisma.appointment.deleteMany({
      where: {
        serviceId: id,
      },
    });

    await this.prisma.service.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message:
        'Service deleted successfully',
    };
  }
}