import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { CloudinaryService } from "src/modules/cloudinary/cloudinary.service";
import { Brand } from "./schema/brand.schema";
import { BrandDTO } from "./dto/brand.dto";

@Injectable()
export class BrandServices {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Brand.name) private brandModel: mongoose.Model<Brand>
  ) {}

  async getAllPublic(): Promise<Brand[]> {
    try {
      const brands = await this.brandModel.find({ 
        status: true,
        deletedAt: null,
      })
      return brands;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllPrivate(): Promise<Brand[]> {
    try {
      const brands = await this.brandModel.find({ deletedAt: null })
      return brands;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getOneBySlug(brandSlug: string): Promise<Brand> {
    try {
      const brand = await this.brandModel.findOne({ slug: brandSlug })
      return brand
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async createNew(brandDTO: BrandDTO, file: Express.Multer.File): Promise<Record<string, any>> {
    const logo = file
      ? await this.cloudinaryService.uploadSingleFile(file, 'sneakerapp/brand')
      : undefined
    
    try {
      const isExisted = await this.brandModel.findOne({ name: brandDTO.name })
      if(isExisted) throw new HttpException('Tên thương hiệu đã tồn tại!', HttpStatus.CONFLICT)

      await this.brandModel.create({
        ...brandDTO,
        logo: logo || {},
        status: true
      })

      return {
        statusCode: 200, 
        message: "Thêm thương hiệu thành công!" 
      }
    } catch (error) {
      if (logo) this.cloudinaryService.deleteFile(logo.path)
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateById(brandId: Types.ObjectId, brandDTO: BrandDTO, file: Express.Multer.File):  Promise<Record<string, any>> {
    const logo = file
      ? await this.cloudinaryService.uploadSingleFile(file, 'sneakerapp/brand')
      : undefined

    try {
      const isExisted = await this.brandModel.findOne({ name: brandDTO.name })
      if(isExisted && isExisted._id != brandId) throw new HttpException('Tên thương hiệu đã tồn tại!', HttpStatus.CONFLICT)

      const current = await this.brandModel.findById(brandId)
      if(logo && current.logo) this.cloudinaryService.deleteFile(current.logo.path)

      await this.brandModel.findByIdAndUpdate(brandId, {
        ...brandDTO,
        logo: logo || current.logo,
      })

      return {
        statusCode: 200, 
        message: "Cập nhật thương hiệu thành công!" 
      }
    } catch (error) {
      if (logo) this.cloudinaryService.deleteFile(logo.path)
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async toggleStatus(brandId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      const current = await this.brandModel.findById(brandId);
      const result = await this.brandModel.findByIdAndUpdate(brandId, {
        status: !current.status
      }, { new: true })
      return {
        statusCode: 200, 
        message: `Thương hiệu ${(result.status) ? "đã được hiển thị" : "đã bị ẩn"}` 
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteById(brandId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      await this.brandModel.findByIdAndUpdate(brandId, {
        deletedAt: new Date()
      })
      return {
        statusCode: 200, 
        message: "Xóa thương hiệu thành công" 
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  
}