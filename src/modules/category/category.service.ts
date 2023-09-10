import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { Category } from "./schema/category.schema";
import { CategoryDTO } from "./dto/category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: mongoose.Model<Category>
  ) {}

  async getAllPublic(): Promise<Category[]> {
    try {
      const categorys = await this.categoryModel.find({ 
        status: true,
        deletedAt: null,
      })
      return categorys;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllPrivate(): Promise<Category[]> {
    try {
      const categorys = await this.categoryModel.find({ deletedAt: null })
      return categorys;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getOneBySlug(categorySlug: string): Promise<Category> {
    try {
      const category = await this.categoryModel.findOne({ slug: categorySlug })
      return category;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async createNew(categoryDTO: CategoryDTO): Promise<Record<string, any>> {
    try {
      const isExisted = await this.categoryModel.findOne({ name: categoryDTO.name })
      if(isExisted) throw new HttpException('Tên danh mục đã tồn tại!', HttpStatus.CONFLICT)

      await this.categoryModel.create({
        ...categoryDTO,
        status: true
      })
      return {
        statusCode: 200, 
        message: "Thêm danh mục thành công!" 
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateById(categoryId: Types.ObjectId, categoryDTO: CategoryDTO):  Promise<Record<string, any>> {
    try {
      const isExisted = await this.categoryModel.findOne({ name: categoryDTO.name })
      if(isExisted && isExisted._id != categoryId) {
        throw new HttpException('Tên danh mục đã tồn tại!', HttpStatus.CONFLICT)
      } 

      await this.categoryModel.findByIdAndUpdate(categoryId, categoryDTO)
      return {
        statusCode: 200, 
        message: "Cập nhật danh mục thành công!" 
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async toggleStatus(categoryId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      const current = await this.categoryModel.findById(categoryId);
      const result = await this.categoryModel.findByIdAndUpdate(categoryId, {
        status: !current.status
      }, { new: true })
      return {
        statusCode: 200, 
        message: `Danh mục ${(result.status) ? "đã được hiển thị" : "đã bị ẩn"}` 
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteById(categoryId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      await this.categoryModel.findByIdAndUpdate(categoryId, {
        deletedAt: new Date()
      })
      return {
        statusCode: 200, 
        message: "Xóa danh mục thành công" 
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}