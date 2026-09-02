import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AdminService } from './admin.service';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // =====================================================
  // USERS
  // =====================================================

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users')
  createUser(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role:
        | 'CUSTOMER'
        | 'SALON_OWNER'
        | 'SALON_MANAGER'
        | 'STAFF';
    },
  ) {
    return this.adminService.createUser(
      body as any,
    );
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body()
    body: {
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
    return this.adminService.updateUser(
      id,
      body,
    );
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status:
        | 'ACTIVE'
        | 'INACTIVE'
        | 'SUSPENDED';
    },
  ) {
    return this.adminService.updateUserStatus(
      id,
      body.status,
    );
  }

  @Delete('users/:id')
  deleteUser(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteUser(id);
  }

  // =====================================================
  // SALONS
  // =====================================================

  @Get('salons')
  getSalons() {
    return this.adminService.getSalons();
  }

  @Post('salons')
  createSalon(
    @Body()
    body: {
      ownerId: string;
      name: string;
      description?: string;
      phone?: string;
      email?: string;
      address: string;
      city: string;
      state?: string;
      postalCode?: string;
      latitude?: number;
      longitude?: number;
      image?: string;
    },
  ) {
    return this.adminService.createSalon(
      body as any,
    );
  }

  @Patch('salons/:id')
  updateSalon(
    @Param('id') id: string,
    @Body()
    body: {
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
    return this.adminService.updateSalon(
      id,
      body,
    );
  }

  @Patch('salons/:id/status')
  updateSalonStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status:
        | 'ACTIVE'
        | 'INACTIVE'
        | 'SUSPENDED';
    },
  ) {
    return this.adminService.updateSalonStatus(
      id,
      body.status,
    );
  }

  // =====================================================
  // DELETE SALON
  // DELETE /admin/salons/:id
  // =====================================================

  @Delete('salons/:id')
  deleteSalon(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteSalon(id);
  }

  // =====================================================
  // SERVICES
  // =====================================================

  @Get('services')
  getServices() {
    return this.adminService.getServices();
  }

  @Post('services')
  createService(
    @Body()
    body: {
      salonId: string;
      categoryId: string;
      name: string;
      description?: string;
      price: number;
      durationMinutes: number;
      image?: string;
    },
  ) {
    return this.adminService.createService(
      body,
    );
  }

  @Patch('services/:id')
  updateService(
    @Param('id') id: string,
    @Body()
    body: {
      salonId?: string;
      categoryId?: string;
      name?: string;
      description?: string;
      price?: number;
      durationMinutes?: number;
      image?: string;
    },
  ) {
    return this.adminService.updateService(
      id,
      body,
    );
  }

  @Patch('services/:id/status')
  updateServiceStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    return this.adminService.updateServiceStatus(
      id,
      body.status,
    );
  }

  @Delete('services/:id')
  deleteService(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteService(id);
  }

  // =====================================================
  // CATEGORIES
  // =====================================================

  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  createCategory(
    @Body()
    body: {
      name: string;
      description?: string;
      image?: string;
    },
  ) {
    return this.adminService.createCategory(
      body,
    );
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      image?: string;
    },
  ) {
    return this.adminService.updateCategory(
      id,
      body,
    );
  }

  @Patch('categories/:id/status')
  updateCategoryStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: boolean;
    },
  ) {
    return this.adminService.updateCategoryStatus(
      id,
      body.status,
    );
  }

  @Delete('categories/:id')
  deleteCategory(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteCategory(
      id,
    );
  }

  // =====================================================
  // STAFF
  // =====================================================

  @Get('staff')
  getStaff() {
    return this.adminService.getStaff();
  }

  @Post('staff')
  createStaff(
    @Body()
    body: {
      userId?: string;
      salonId: string;
      name: string;
      bio?: string;
      specialization?: string;
      profileImage?: string;
      experienceYears?: number;
    },
  ) {
    return this.adminService.createStaff(
      body,
    );
  }

  @Patch('staff/:id')
  updateStaff(
    @Param('id') id: string,
    @Body()
    body: {
      userId?: string | null;
      salonId?: string;
      name?: string;
      bio?: string;
      specialization?: string;
      profileImage?: string;
      experienceYears?: number;
    },
  ) {
    return this.adminService.updateStaff(
      id,
      body,
    );
  }

  @Patch('staff/:id/status')
  updateStaffStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    return this.adminService.updateStaffStatus(
      id,
      body.status,
    );
  }

  @Delete('staff/:id')
  deleteStaff(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteStaff(id);
  }

  // =====================================================
  // APPOINTMENTS
  // =====================================================

  @Get('appointments')
  getAppointments() {
    return this.adminService.getAppointments();
  }

  @Patch('appointments/:id/status')
  updateAppointmentStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status:
        | 'PENDING'
        | 'CONFIRMED'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'NO_SHOW';
    },
  ) {
    return this.adminService.updateAppointmentStatus(
      id,
      body.status,
    );
  }

  // =====================================================
  // REVIEWS
  // =====================================================

  @Get('reviews')
  getReviews() {
    return this.adminService.getReviews();
  }

  @Patch('reviews/:id/status')
  updateReviewStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status:
        | 'PENDING'
        | 'APPROVED'
        | 'REJECTED';
    },
  ) {
    return this.adminService.updateReviewStatus(
      id,
      body.status,
    );
  }

  @Delete('reviews/:id')
  deleteReview(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteReview(id);
  }
}