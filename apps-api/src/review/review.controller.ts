import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
  ) {}

  // =====================================================
  // CUSTOMER: CREATE REVIEW
  // POST /reviews
  // =====================================================

  @Post()
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('CUSTOMER')
  create(
    @Req() request: any,

    @Body()
    createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(
      request.user.userId,
      createReviewDto,
    );
  }

  // =====================================================
  // PUBLIC: GET SALON REVIEWS
  // GET /reviews/salon/:salonId
  // =====================================================

  @Get('salon/:salonId')
  findBySalon(
    @Param('salonId')
    salonId: string,
  ) {
    return this.reviewService.findBySalon(
      salonId,
    );
  }

  // =====================================================
  // CUSTOMER: MY REVIEWS
  // GET /reviews/my
  // =====================================================

  @Get('my')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('CUSTOMER')
  findByCustomer(
    @Req() request: any,
  ) {
    return this.reviewService.findByCustomer(
      request.user.userId,
    );
  }

  // =====================================================
  // ADMIN: GET ALL REVIEWS
  // GET /reviews/admin/all
  // =====================================================

  @Get('admin/all')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('ADMIN')
  adminFindAll() {
    return this.reviewService.adminFindAll();
  }

  // =====================================================
  // ADMIN: APPROVE
  // PATCH /reviews/:id/approve
  // =====================================================

  @Patch(':id/approve')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('ADMIN')
  approve(
    @Param('id') id: string,
  ) {
    return this.reviewService.approve(id);
  }

  // =====================================================
  // ADMIN: REJECT
  // PATCH /reviews/:id/reject
  // =====================================================

  @Patch(':id/reject')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('ADMIN')
  reject(
    @Param('id') id: string,
  ) {
    return this.reviewService.reject(id);
  }

  // =====================================================
  // ADMIN: STATUS UPDATE
  // PATCH /reviews/:id/status
  // =====================================================

  @Patch(':id/status')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string,

    @Body()
    body: {
      status:
        | 'PENDING'
        | 'APPROVED'
        | 'REJECTED';
    },
  ) {
    return this.reviewService.updateStatus(
      id,
      body.status,
    );
  }

  // =====================================================
  // ADMIN: DELETE
  // DELETE /reviews/:id
  // =====================================================

  @Delete(':id')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles('ADMIN')
  remove(
    @Param('id') id: string,
  ) {
    return this.reviewService.remove(id);
  }
}