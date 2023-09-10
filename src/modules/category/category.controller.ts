import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { Category } from "./schema/category.schema";
import { CategoryService } from "./category.service";
import { CategoryDTO } from "./dto/category.dto";

@Controller("category")
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllPrivate(): Promise<Category[]> {
    return this.categoryService.getAllPrivate();
  }

  @Get('public')
  async getAllPublic(): Promise<Category[]> {
    return this.categoryService.getAllPublic();
  }

  @Get(':slug')
  async getOneBySlug(@Param('slug') categorySlug: string): Promise<Category> {
    return this.categoryService.getOneBySlug(categorySlug)
  }

  @Post()
  @UseGuards(AuthGuard)
  async createNew(@Body() categoryDTO: CategoryDTO): Promise<Record<string, any>> {
    return this.categoryService.createNew(categoryDTO)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateById(
    @Param('id') categoryId: Types.ObjectId,
    @Body() categoryDTO: CategoryDTO,
  ):  Promise<Record<string, any>> {
    return this.categoryService.updateById(categoryId, categoryDTO);
  }

  @Put('hide/:id')
  @UseGuards(AuthGuard)
  async toggleStatus(@Param('id') categoryId: Types.ObjectId): Promise<Record<string, any>> {
    return this.categoryService.toggleStatus(categoryId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteById(@Param('id') categoryId: Types.ObjectId): Promise<Record<string, any>> {
    return this.categoryService.deleteById(categoryId)
  }
}