import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE CATEGORY
  async create(name: string, description?: string, image?: string) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        description,
        image,
      },
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  // GET ALL ACTIVE CATEGORIES
  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: {
        status: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: categories,
    };
  }

  // GET SINGLE CATEGORY
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      success: true,
      data: category,
    };
  }
}