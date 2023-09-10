import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { Product } from "../product/schema/product.schema";
import { ProductVersion } from "../productVersion/schema/version.schema";
import { Import } from "./schema/import.schema";
import { createImportDTO } from "./dto/import.dto";

@Injectable()
export class ImportService {
  constructor(
    @InjectModel(ProductVersion.name) private versionModel: mongoose.Model<ProductVersion>,
    @InjectModel(Product.name) private productModel: mongoose.Model<Product>,
    @InjectModel(Import.name) private importModel: mongoose.Model<Import>,
  ) { }

  async createNew(dto: createImportDTO): Promise<Record<string, any>> {
    try {
      var total = dto.products.reduce(
        (result, product) => result + (product.price * product.detail.reduce(
          (count, item) => count + item.quantity, 0)
        ), 0);

      await this.importModel.create({ ...dto, total: total })

      dto.products.forEach(async (element) => {
        await this.productModel.findByIdAndUpdate(
          element.product,
          { price: element.price },
          { new: true }
        );
        element.detail.forEach(async (item) => {
          var versionAggregate = await this.versionModel
            .aggregate([{ $match: { _id: new Types.ObjectId(item.version) } }])
            .unwind('sizes');
          var versionWithSize = versionAggregate.find(e => e.sizes.sku === item.size)
          var newQuantity = item.quantity + versionWithSize.sizes.quantity
          await this.versionModel.findByIdAndUpdate(
            item.version,
            { '$set': { ['sizes.$[element].quantity']: newQuantity } },
            { 'arrayFilters': [{ 'element.sku': item.size }] }
          )
        })
      });

      return {
        statusCode: 200,
        message: "Thêm phiếu nhập hàng thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAll(): Promise<Import[]> {
    try {
      const imports = await this.importModel.find().populate('employee')
      return imports;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getById(importId: Types.ObjectId): Promise<Import> {
    try {
      const result = await this.importModel.findById(importId)
        .populate({ path: 'employee', select: 'name role' })
        .populate({
          path: 'products',
          populate: { path: 'product', select: 'name' }
        })
        .populate({
          path: 'products',
          populate: {
            path: 'detail',
            populate: { path: 'version', select: 'name' }
          }
        })
        return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
