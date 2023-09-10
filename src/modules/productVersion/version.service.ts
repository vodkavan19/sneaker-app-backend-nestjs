import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Product } from "../product/schema/product.schema";
import { ProductVersion } from "./schema/version.schema";
import { ProductVersionDTO, UpdateProductVersionDTO } from "./dto/version.dto";

@Injectable()
export class ProductVersionService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Product.name) private productModel: mongoose.Model<Product>,
    @InjectModel(ProductVersion.name) private versionModel: mongoose.Model<ProductVersion>
  ) { }

  async createNew(versionDTO: ProductVersionDTO, files: Array<Express.Multer.File>): Promise<Record<string, any>> {
    const images = await this.cloudinaryService.uploadArrayFiles(files, 'sneakerapp/product')

    try {
      var sizes = [];
      const sizeRange = await this.productModel.findById(versionDTO.product)
        .select('sizeMin sizeMax');
      for (let i = sizeRange.sizeMin; i <= sizeRange.sizeMax; i++) {
        sizes.push({ sku: i, quantity: 0 })
      }

      await this.versionModel.create({
        ...versionDTO,
        images: images,
        sizes: sizes,
        status: true
      })
      return {
        statusCode: 200,
        message: "Thêm phiên bản sản phẩm thành công!"
      }
    } catch (error) {
      images.forEach(image => this.cloudinaryService.deleteFile(image.path))
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getByProduct(queryParams: Record<string, any>): Promise<ProductVersion[]> {
    try {
      const versions = await this.versionModel.find({
        product: queryParams.product,
        deletedAt: null,
        status: true,
      })
        .populate({ path: 'product' })
        .populate({
          path: 'product',
          populate: { path: 'brand', select: 'name' }
        });

      return versions;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getById(versionId: Types.ObjectId): Promise<ProductVersion> {
    try {
      const version = await this.versionModel.findById(versionId);
      return version;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateById(versionId: Types.ObjectId, versionDTO: UpdateProductVersionDTO, files?: Array<Express.Multer.File>): Promise<Record<string, any>> {
    const imagesUploaded = await this.cloudinaryService.uploadArrayFiles(files, 'sneakerapp/product')

    try {
      const current = await this.versionModel.findById(versionId)
      var images = current.images;
      for (let i = 0; i < imagesUploaded.length; i++) {
        var idx = versionDTO.idxImgUpdate[i];
        await this.cloudinaryService.deleteFile(images[idx].path)
        images[idx] = { link: imagesUploaded[i].link, path: imagesUploaded[i].path}
      }

      await this.versionModel.findByIdAndUpdate(versionId, {
        ...versionDTO,
        images: images,
      })
      return {
        statusCode: 200,
        message: "Cập nhật phiên bản thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async toggleStatus(versionId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      const current = await this.versionModel.findById(versionId)
      const result = await this.versionModel.findByIdAndUpdate(versionId, {
        status: !current.status 
      }, { new: true })
      return {
        statusCode: 200,
        message: `Phiên bản sản phẩm ${(result.status) ? "đã được hiển thị" : "đã bị ẩn"}`
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteById(versionId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      await this.versionModel.findByIdAndUpdate(versionId, {
        deletedAt: new Date()
      })
      return {
        statusCode: 200,
        message: "Xóa phiên bản sản phẩm thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}