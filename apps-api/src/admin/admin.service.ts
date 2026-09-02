import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateAdminSalonDto } from './dto/create-admin-salon.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  async getDashboard() {
    const [
      totalUsers,
      totalCustomers,
      totalSalonOwners,
      totalStaffUsers,
      totalSalons,
      totalServices,
      totalCategories,
      totalStaff,
      totalAppointments,
      totalReviews,
      activeUsers,
      activeSalons,
      activeServices,
      activeStaff,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      pendingReviews,
      revenue,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),

      this.prisma.user.count({
        where: { role: 'SALON_OWNER' },
      }),

      this.prisma.user.count({
        where: { role: 'STAFF' },
      }),

      this.prisma.salon.count(),

      this.prisma.service.count(),

      this.prisma.category.count(),

      this.prisma.staff.count(),

      this.prisma.appointment.count(),

      this.prisma.review.count(),

      this.prisma.user.count({
        where: { status: 'ACTIVE' },
      }),

      this.prisma.salon.count({
        where: { status: 'ACTIVE' },
      }),

      this.prisma.service.count({
        where: { status: 'ACTIVE' },
      }),

      this.prisma.staff.count({
        where: { status: 'ACTIVE' },
      }),

      this.prisma.appointment.count({
        where: { status: 'PENDING' },
      }),

      this.prisma.appointment.count({
        where: { status: 'CONFIRMED' },
      }),

      this.prisma.appointment.count({
        where: { status: 'COMPLETED' },
      }),

      this.prisma.appointment.count({
        where: { status: 'CANCELLED' },
      }),

      this.prisma.review.count({
        where: { status: 'PENDING' },
      }),

      this.prisma.appointment.aggregate({
        where: {
          status: 'COMPLETED',
        },
        _sum: {
          price: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalSalonOwners,
        totalStaffUsers,
        totalSalons,
        totalServices,
        totalCategories,
        totalStaff,
        totalAppointments,
        totalReviews,
        activeUsers,
        activeSalons,
        activeServices,
        activeStaff,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        pendingReviews,
        totalRevenue: revenue._sum.price ?? 0,
      },
    };
  }

  // =====================================================
  // USERS
  // =====================================================

  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: users,
    };
  }

  async createUser(
    dto: CreateAdminUserDto,
  ) {
    const existing =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const passwordHash =
      await bcrypt.hash(dto.password, 12);

    const user =
      await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          phone: dto.phone,
          role: dto.role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      role?:
        | 'CUSTOMER'
        | 'SALON_OWNER'
        | 'SALON_MANAGER'
        | 'STAFF';
    },
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: { id },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (
      data.email &&
      data.email !== user.email
    ) {
      const exists =
        await this.prisma.user.findUnique({
          where: {
            email: data.email,
          },
        });

      if (exists) {
        throw new ConflictException(
          'Email already exists',
        );
      }
    }

    const updated =
      await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
        },
      });

    return {
      success: true,
      message: 'User updated successfully',
      data: updated,
    };
  }

  async updateUserStatus(
    id: string,
    status:
      | 'ACTIVE'
      | 'INACTIVE'
      | 'SUSPENDED',
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: { id },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const updated =
      await this.prisma.user.update({
        where: { id },
        data: { status },
      });

    return {
      success: true,
      message: 'User status updated successfully',
      data: updated,
    };
  }

  async deleteUser(id: string) {
    const user =
      await this.prisma.user.findUnique({
        where: { id },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.refreshToken.deleteMany({
          where: {
            userId: id,
          },
        });

        await tx.review.deleteMany({
          where: {
            customerId: id,
          },
        });

        await tx.appointment.deleteMany({
          where: {
            customerId: id,
          },
        });

        await tx.staff.updateMany({
          where: {
            userId: id,
          },
          data: {
            userId: null,
          },
        });

        await tx.salon.updateMany({
          where: {
            managerId: id,
          },
          data: {
            managerId: null,
          },
        });

        await tx.user.delete({
          where: { id },
        });
      },
    );

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  // =====================================================
  // SALONS
  // =====================================================

  async getSalons() {
    const salons =
      await this.prisma.salon.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          services: true,
          staff: true,
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

  async createSalon(
    dto: CreateAdminSalonDto,
  ) {
    const owner =
      await this.prisma.user.findUnique({
        where: {
          id: dto.ownerId,
        },
      });

    if (!owner) {
      throw new NotFoundException(
        'Salon owner not found',
      );
    }

    if (owner.role !== 'SALON_OWNER') {
      throw new ConflictException(
        'Selected user is not a SALON_OWNER',
      );
    }

    const slug =
      await this.generateUniqueSlug(
        dto.name,
      );

    const salon =
      await this.prisma.salon.create({
        data: {
          ownerId: dto.ownerId,
          name: dto.name,
          slug,
          description: dto.description,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          latitude: dto.latitude,
          longitude: dto.longitude,
          image: dto.image,
        },
      });

    return {
      success: true,
      message: 'Salon created successfully',
      data: salon,
    };
  }

  async updateSalon(
    id: string,
    data: {
      ownerId?: string;
      name?: string;
      description?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      latitude?: number;
      longitude?: number;
      image?: string;
    },
  ) {
    const salon =
      await this.prisma.salon.findUnique({
        where: { id },
      });

    if (!salon) {
      throw new NotFoundException(
        'Salon not found',
      );
    }

    const updateData: any = {
      ...data,
    };

    if (
      data.name &&
      data.name !== salon.name
    ) {
      updateData.slug =
        await this.generateUniqueSlug(
          data.name,
          id,
        );
    }

    const updated =
      await this.prisma.salon.update({
        where: { id },
        data: updateData,
      });

    return {
      success: true,
      message: 'Salon updated successfully',
      data: updated,
    };
  }

  async updateSalonStatus(
    id: string,
    status:
      | 'ACTIVE'
      | 'INACTIVE'
      | 'SUSPENDED',
  ) {
    const salon =
      await this.prisma.salon.findUnique({
        where: { id },
      });

    if (!salon) {
      throw new NotFoundException(
        'Salon not found',
      );
    }

    const updated =
      await this.prisma.salon.update({
        where: { id },
        data: { status },
      });

    return {
      success: true,
      message: 'Salon status updated successfully',
      data: updated,
    };
  }

  // =====================================================
  // DELETE SALON
  // =====================================================

  async deleteSalon(id: string) {
    const salon =
      await this.prisma.salon.findUnique({
        where: { id },
      });

    if (!salon) {
      throw new NotFoundException(
        'Salon not found',
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        const staff =
          await tx.staff.findMany({
            where: {
              salonId: id,
            },
            select: {
              id: true,
            },
          });

        const staffIds =
          staff.map(
            (item) => item.id,
          );

        await tx.review.deleteMany({
          where: {
            salonId: id,
          },
        });

        await tx.appointment.deleteMany({
          where: {
            salonId: id,
          },
        });

        if (staffIds.length > 0) {
          await tx.staffLeave.deleteMany({
            where: {
              staffId: {
                in: staffIds,
              },
            },
          });

          await tx.workingHour.deleteMany({
            where: {
              staffId: {
                in: staffIds,
              },
            },
          });
        }

        await tx.workingHour.deleteMany({
          where: {
            salonId: id,
          },
        });

        await tx.staff.deleteMany({
          where: {
            salonId: id,
          },
        });

        await tx.service.deleteMany({
          where: {
            salonId: id,
          },
        });

        await tx.salon.delete({
          where: {
            id,
          },
        });
      },
    );

    return {
      success: true,
      message: 'Salon deleted successfully',
    };
  }

  // =====================================================
  // SERVICES
  // =====================================================

  async getServices() {
    const services =
      await this.prisma.service.findMany({
        include: {
          salon: {
            select: {
              id: true,
              name: true,
            },
          },
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

  async createService(data: {
    salonId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
    image?: string;
  }) {
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

    const service =
      await this.prisma.service.create({
        data: {
          salonId: data.salonId,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          durationMinutes:
            data.durationMinutes,
          image: data.image,
        },
      });

    return {
      success: true,
      message: 'Service created successfully',
      data: service,
    };
  }

  async updateService(
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
        where: { id },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    const updated =
      await this.prisma.service.update({
        where: { id },
        data,
      });

    return {
      success: true,
      message: 'Service updated successfully',
      data: updated,
    };
  }

  async updateServiceStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
  ) {
    const service =
      await this.prisma.service.findUnique({
        where: { id },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    const updated =
      await this.prisma.service.update({
        where: { id },
        data: { status },
      });

    return {
      success: true,
      message: 'Service status updated successfully',
      data: updated,
    };
  }

  async deleteService(id: string) {
    const service =
      await this.prisma.service.findUnique({
        where: { id },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    await this.prisma.appointment.deleteMany({
      where: {
        serviceId: id,
      },
    });

    await this.prisma.service.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  }

  // =====================================================
  // CATEGORIES
  // =====================================================

  async getCategories() {
    const categories =
      await this.prisma.category.findMany({
        include: {
          _count: {
            select: {
              services: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return {
      success: true,
      data: categories,
    };
  }

  async createCategory(data: {
    name: string;
    description?: string;
    image?: string;
  }) {
    const existing =
      await this.prisma.category.findUnique({
        where: {
          name: data.name,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Category already exists',
      );
    }

    const category =
      await this.prisma.category.create({
        data,
      });

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      image?: string;
    },
  ) {
    const category =
      await this.prisma.category.findUnique({
        where: { id },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    const updated =
      await this.prisma.category.update({
        where: { id },
        data,
      });

    return {
      success: true,
      message: 'Category updated successfully',
      data: updated,
    };
  }

  async updateCategoryStatus(
    id: string,
    status: boolean,
  ) {
    const category =
      await this.prisma.category.findUnique({
        where: { id },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    const updated =
      await this.prisma.category.update({
        where: { id },
        data: { status },
      });

    return {
      success: true,
      message: 'Category status updated successfully',
      data: updated,
    };
  }

  async deleteCategory(id: string) {
    const category =
      await this.prisma.category.findUnique({
        where: { id },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    const services =
      await this.prisma.service.count({
        where: {
          categoryId: id,
        },
      });

    if (services > 0) {
      throw new ConflictException(
        'Cannot delete category because services are using it',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  // =====================================================
  // STAFF
  // =====================================================

  async getStaff() {
    const staff =
      await this.prisma.staff.findMany({
        include: {
          salon: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
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
      data: staff,
    };
  }

  async createStaff(data: {
    userId?: string;
    salonId: string;
    name: string;
    bio?: string;
    specialization?: string;
    profileImage?: string;
    experienceYears?: number;
  }) {
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

    const staff =
      await this.prisma.staff.create({
        data: {
          userId: data.userId,
          salonId: data.salonId,
          name: data.name,
          bio: data.bio,
          specialization:
            data.specialization,
          profileImage:
            data.profileImage,
          experienceYears:
            data.experienceYears ?? 0,
        },
      });

    return {
      success: true,
      message: 'Staff created successfully',
      data: staff,
    };
  }

  async updateStaff(
    id: string,
    data: {
      userId?: string | null;
      salonId?: string;
      name?: string;
      bio?: string;
      specialization?: string;
      profileImage?: string;
      experienceYears?: number;
    },
  ) {
    const staff =
      await this.prisma.staff.findUnique({
        where: { id },
      });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found',
      );
    }

    const updated =
      await this.prisma.staff.update({
        where: { id },
        data,
      });

    return {
      success: true,
      message: 'Staff updated successfully',
      data: updated,
    };
  }

  async updateStaffStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
  ) {
    const staff =
      await this.prisma.staff.findUnique({
        where: { id },
      });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found',
      );
    }

    const updated =
      await this.prisma.staff.update({
        where: { id },
        data: { status },
      });

    return {
      success: true,
      message: 'Staff status updated successfully',
      data: updated,
    };
  }

  async deleteStaff(id: string) {
    const staff =
      await this.prisma.staff.findUnique({
        where: { id },
      });

    if (!staff) {
      throw new NotFoundException(
        'Staff not found',
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.staffLeave.deleteMany({
          where: {
            staffId: id,
          },
        });

        await tx.workingHour.deleteMany({
          where: {
            staffId: id,
          },
        });

        await tx.appointment.deleteMany({
          where: {
            staffId: id,
          },
        });

        await tx.staff.delete({
          where: {
            id,
          },
        });
      },
    );

    return {
      success: true,
      message: 'Staff deleted successfully',
    };
  }

  // =====================================================
  // APPOINTMENTS
  // =====================================================

  async getAppointments() {
    const appointments =
      await this.prisma.appointment.findMany({
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          salon: {
            select: {
              id: true,
              name: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
            },
          },
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

  async updateAppointmentStatus(
    id: string,
    status:
      | 'PENDING'
      | 'CONFIRMED'
      | 'COMPLETED'
      | 'CANCELLED'
      | 'NO_SHOW',
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: { id },
      });

    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found',
      );
    }

    const updated =
      await this.prisma.appointment.update({
        where: { id },
        data: { status },
      });

    return {
      success: true,
      message:
        'Appointment status updated successfully',
      data: updated,
    };
  }

  // =====================================================
  // REVIEWS
  // =====================================================

  async getReviews() {
    const reviews =
      await this.prisma.review.findMany({
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          salon: {
            select: {
              id: true,
              name: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
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
      data: reviews,
    };
  }

  async updateReviewStatus(
    id: string,
    status:
      | 'PENDING'
      | 'APPROVED'
      | 'REJECTED',
  ) {
    const review =
      await this.prisma.review.findUnique({
        where: { id },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    const updated =
      await this.prisma.review.update({
        where: { id },
        data: { status },
      });

    await this.recalculateSalonRating(
      review.salonId,
    );

    return {
      success: true,
      message:
        'Review status updated successfully',
      data: updated,
    };
  }

  async deleteReview(id: string) {
    const review =
      await this.prisma.review.findUnique({
        where: { id },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    const salonId = review.salonId;

    await this.prisma.review.delete({
      where: { id },
    });

    await this.recalculateSalonRating(
      salonId,
    );

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private async generateUniqueSlug(
    name: string,
    excludeId?: string,
  ): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing =
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

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  private async recalculateSalonRating(
    salonId: string,
  ) {
    const result =
      await this.prisma.review.aggregate({
        where: {
          salonId,
          status: 'APPROVED',
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });

    await this.prisma.salon.update({
      where: {
        id: salonId,
      },
      data: {
        rating: result._avg.rating ?? 0,
        reviewCount:
          result._count.rating,
      },
    });
  }
}