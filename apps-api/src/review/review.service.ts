import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // UPDATE SALON RATING
  // =====================================================

  private async updateSalonRating(
    salonId: string,
  ) {
    const ratingData =
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
        rating:
          ratingData._avg.rating ?? 0,

        reviewCount:
          ratingData._count.rating,
      },
    });
  }

  // =====================================================
  // CREATE REVIEW
  // POST /reviews
  // CUSTOMER ONLY
  // =====================================================

  async create(
    customerId: string,
    createReviewDto: CreateReviewDto,
  ) {
    const {
      appointmentId,
      rating,
      comment,
    } = createReviewDto;

    // ---------------------------------------------------
    // CHECK APPOINTMENT
    // ---------------------------------------------------

    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id: appointmentId,
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

    // ---------------------------------------------------
    // ONLY APPOINTMENT CUSTOMER CAN REVIEW
    // ---------------------------------------------------

    if (
      appointment.customerId !==
      customerId
    ) {
      throw new ForbiddenException(
        'You can only review your own appointment',
      );
    }

    // ---------------------------------------------------
    // APPOINTMENT MUST BE COMPLETED
    // ---------------------------------------------------

    if (
      appointment.status !==
      'COMPLETED'
    ) {
      throw new ConflictException(
        'Only completed appointments can be reviewed',
      );
    }

    // ---------------------------------------------------
    // CHECK EXISTING REVIEW
    // ---------------------------------------------------

    const existingReview =
      await this.prisma.review.findUnique({
        where: {
          appointmentId,
        },
      });

    if (existingReview) {
      throw new ConflictException(
        'Review already exists for this appointment',
      );
    }

    // ---------------------------------------------------
    // CREATE AS PENDING
    // ---------------------------------------------------

    const review =
      await this.prisma.review.create({
        data: {
          customerId,

          salonId:
            appointment.salonId,

          appointmentId,

          rating,

          comment,

          status: 'PENDING',
        },

        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },

          salon: {
            select: {
              id: true,
              name: true,
            },
          },

          appointment: true,
        },
      });

    return {
      success: true,

      message:
        'Review submitted successfully and is waiting for approval',

      data: review,
    };
  }

  // =====================================================
  // GET APPROVED REVIEWS BY SALON
  // GET /reviews/salon/:salonId
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

    const reviews =
      await this.prisma.review.findMany({
        where: {
          salonId,

          status: 'APPROVED',
        },

        include: {
          customer: {
            select: {
              id: true,
              name: true,
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

  // =====================================================
  // GET MY REVIEWS
  // GET /reviews/my
  // CUSTOMER ONLY
  // =====================================================

  async findByCustomer(
    customerId: string,
  ) {
    const reviews =
      await this.prisma.review.findMany({
        where: {
          customerId,
        },

        include: {
          salon: true,
          appointment: true,
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

  // =====================================================
  // ADMIN: GET ALL REVIEWS
  // GET /reviews/admin/all
  // =====================================================

  async adminFindAll() {
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
              city: true,
            },
          },

          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              startTime: true,
              endTime: true,
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

  // =====================================================
  // ADMIN: APPROVE REVIEW
  // PATCH /reviews/:id/approve
  // =====================================================

  async approve(
    id: string,
  ) {
    const review =
      await this.prisma.review.findUnique({
        where: {
          id,
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    if (
      review.status ===
      'APPROVED'
    ) {
      throw new ConflictException(
        'Review is already approved',
      );
    }

    const updatedReview =
      await this.prisma.review.update({
        where: {
          id,
        },

        data: {
          status: 'APPROVED',
        },

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
        },
      });

    // Update salon rating after approval
    await this.updateSalonRating(
      review.salonId,
    );

    return {
      success: true,

      message:
        'Review approved successfully',

      data: updatedReview,
    };
  }

  // =====================================================
  // ADMIN: REJECT REVIEW
  // PATCH /reviews/:id/reject
  // =====================================================

  async reject(
    id: string,
  ) {
    const review =
      await this.prisma.review.findUnique({
        where: {
          id,
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    const updatedReview =
      await this.prisma.review.update({
        where: {
          id,
        },

        data: {
          status: 'REJECTED',
        },

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
        },
      });

    // Recalculate rating in case an approved
    // review was changed to rejected.
    await this.updateSalonRating(
      review.salonId,
    );

    return {
      success: true,

      message:
        'Review rejected successfully',

      data: updatedReview,
    };
  }

  // =====================================================
  // ADMIN: UPDATE REVIEW STATUS
  // PATCH /reviews/:id/status
  // =====================================================

  async updateStatus(
    id: string,
    status:
      | 'PENDING'
      | 'APPROVED'
      | 'REJECTED',
  ) {
    const review =
      await this.prisma.review.findUnique({
        where: {
          id,
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    const updatedReview =
      await this.prisma.review.update({
        where: {
          id,
        },

        data: {
          status,
        },

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
        },
      });

    // Recalculate salon rating
    await this.updateSalonRating(
      review.salonId,
    );

    return {
      success: true,

      message:
        'Review status updated successfully',

      data: updatedReview,
    };
  }

  // =====================================================
  // ADMIN: DELETE REVIEW
  // DELETE /reviews/:id
  // =====================================================

  async remove(
    id: string,
  ) {
    const review =
      await this.prisma.review.findUnique({
        where: {
          id,
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    const salonId =
      review.salonId;

    await this.prisma.review.delete({
      where: {
        id,
      },
    });

    // Recalculate salon rating after delete
    await this.updateSalonRating(
      salonId,
    );

    return {
      success: true,

      message:
        'Review deleted successfully',
    };
  }
}