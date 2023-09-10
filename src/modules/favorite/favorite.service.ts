import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { Product } from "../product/schema/product.schema";
import { Customer } from "../customer/schema/customer.schema";
import { FavoriteDTO } from "./dto/favorite.dto";

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Customer.name) private customerModel: mongoose.Model<Customer>,
    @InjectModel(Product.name) private productModel: mongoose.Model<Product>,
  ) { }

  async getAllByCustomer(queryParams: Record<string, any>): Promise<Product[]> {
    try {
      var result = [];
      const customer = await this.customerModel.findById(queryParams.customer)
      for (var item of customer.favorites) {
        var product = await this.productModel.findOne({
          _id: item,
          status: true,
          deletedAt: null,
        })
          .populate({
            path: 'versions',
            match: { status: true, deletedAt: null },
            select: 'images name',
          })
          .populate({ path: 'brand', select: 'name' })
          .populate({ path: 'category', select: 'name' });

        result.push(product)
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async toggleFavorite(favoriteDTO: FavoriteDTO): Promise<Record<string, any>> {
    try {
      var result = {};
      const customer = await this.customerModel.findById(favoriteDTO.customer)
      const favorites: string[] | null = customer.favorites;
      if (favorites == null || !favorites.includes(favoriteDTO.product)) {
        result = await this.customerModel.findOneAndUpdate(
          { _id: new Types.ObjectId(favoriteDTO.customer) },
          {
            $push: {
              favorites: new Types.ObjectId(favoriteDTO.product)
            }
          },
          { new: true }
        )
      } else {
        result = await this.customerModel.findOneAndUpdate(
          { _id: new Types.ObjectId(favoriteDTO.customer) },
          {
            $pull: {
              favorites: new Types.ObjectId(favoriteDTO.product)
            }
          },
          { new: true }
        )
        console.log(result);

      }

      return {
        statusCode: 200,
        message: 'Cập nhật danh sách yêu thích thành công',
        favorites: result['favorites']
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}