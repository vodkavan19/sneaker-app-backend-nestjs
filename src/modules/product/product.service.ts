import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { Category } from "../category/schema/category.schema";
import { Brand } from "../brand/schema/brand.schema";
import { Product } from "./schema/product.schema";
import { ProductDTO, SearchDTO } from "./dto/product.dto";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Brand.name) private brandModel: mongoose.Model<Brand>,
    @InjectModel(Category.name) private categoryModel: mongoose.Model<Category>,
    @InjectModel(Product.name) private productModel: mongoose.Model<Product>
  ) { }

  async createNew(productDTO: ProductDTO): Promise<Record<string, any>> {
    try {
      const result = await this.productModel.create({
        ...productDTO,
        status: true,
        sold: 0,
        star: 0
      })
      return {
        statusCode: 200,
        data: result,
        message: "Thêm mới sản phẩm thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAll(): Promise<Product[]> {
    try {
      const products = await this.productModel.find({ deletedAt: null })
        .populate({ path: 'versions', match: { deletedAt: null } })
        .populate({ path: 'brand', select: 'name' })
        .populate({ path: 'category', select: 'name' })
        
      return products;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllName(): Promise<Record<string, any>[]> {
    try {
      const productNames = await this.productModel.find({ deletedAt: null }).select('name')
      return productNames;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async search(queryParams: Record<string, any>): Promise<Product[]> {
    try {
      var result = [];
      if (queryParams.q) {
        result = await this.productModel.aggregate()
          .search({
            index: 'productSearch',
            compound: {
              must: [{
                text: {
                  query: queryParams.q,
                  path: ['name', 'gender', 'brand'],
                  fuzzy: { maxEdits: 1 },
                },
              }],
            },
          })
          .match({ deletedAt: null, status: true })
          .lookup({
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brand',
            pipeline: [{
              $project: { 'name': 1 }
            }]
          })
        .lookup({
          from: 'productversions',
          localField: '_id',
          foreignField: 'product',
          as: 'versions',
          pipeline: [{
            $project: { 'images': 1, 'name': 1 }
          }]
        })
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getOnePage(searchDTO: SearchDTO): Promise<Record<string, any>> {
    try {
      const params = { status: true, deletedAt: null }
      if (searchDTO.brand) {
        params['brand'] = searchDTO.brand
      }
      if (searchDTO.category) {
        params['category'] = searchDTO.category
      }
      if (searchDTO.star) {
        params['star'] = { $gte: searchDTO.star }
      }
      if (searchDTO.size) {
        params['sizeMin'] = { $lte: searchDTO.size }
        params['sizeMax'] = { $gte: searchDTO.size }
      }
      if (searchDTO.priceMin && searchDTO.priceMax) {
        params['price'] = { $gte: searchDTO.priceMin, $lte: searchDTO.priceMax };
      }

      const sort = {};
      const [field, order] = searchDTO.sort.split(":");
      sort[field] = order === 'asc' ? 1 : -1

      const totalResult = await this.productModel.find(params).count();
      const results = await this.productModel.find(params)
        .populate({
          path: 'versions',
          match: { status: true, deletedAt: null },
          select: 'images name',
        })
        .populate({ path: 'brand', select: 'name' })
        .populate({ path: 'category', select: 'name' })
        .sort(sort)
        .skip((searchDTO.page - 1) * searchDTO.limit)
        .limit(searchDTO.limit);

      const brand = (searchDTO.brand)
        ? await this.brandModel.findById(searchDTO.brand).select('name -_id')
        : null;
      const category = (searchDTO.category)
        ? await this.categoryModel.findById(searchDTO.category).select('name -_id')
        : null;
      const size = (searchDTO.size) ? `Size ${searchDTO.size} EU` : null
      const star = (searchDTO.star) ? `Từ ${searchDTO.star} sao` : null
      return {
        data: results,
        pagination: {
          page: searchDTO.page,
          limit: searchDTO.limit,
          total: totalResult,
        },
        category: category?.name,
        brand: brand?.name,
        size: size,
        star: star,
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getSimilarByBrand(queryParams: Record<string, any>): Promise<Product[]> {
    try {
      const similar = await this.productModel.find({
        status: true,
        deletedAt: null,
        brand: queryParams.brand,
        _id: { $ne: queryParams.product }
      })
        .populate({
          path: 'versions',
          match: { status: true, deletedAt: null },
          select: 'images name',
        })
        .populate({ path: 'brand', select: 'name' })
        .populate({ path: 'category', select: 'name' })
        .sort({ createdAt: 'desc' })
        .limit(12);

      return similar
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getBestSeller(queryParams: Record<string, any>): Promise<Product[]> {
    try {
      const similar = await this.productModel.find({
        status: true,
        deletedAt: null,
        _id: { $ne: queryParams.product }
      })
        .populate({
          path: 'versions',
          match: { status: true, deletedAt: null },
          select: 'images name',
        })
        .populate({ path: 'brand', select: 'name' })
        .populate({ path: 'category', select: 'name' })
        .sort({ sold: 'desc' })
        .limit(12);

      return similar;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async distributeByBrand(): Promise<Product[]> {
    try {
      const result = await this.productModel.aggregate([
        {
          $match: {
            $and: [
              { deletedAt: null },
              { status: true }
            ]
          }
        },
        { $sort: { sold: -1 } },
        {
          $lookup: {
            from: 'productversions',
            localField: '_id',
            foreignField: 'product',
            as: 'versions'
          }
        },
        {
          $group: {
            _id: "$brand",
            products: {
              $push: "$$ROOT"
            },
          }
        },
        {
          $lookup: {
            from: 'brands',
            localField: '_id',
            foreignField: '_id',
            as: 'brand'
          }
        },
        { $unwind: "$brand" },
        { $addFields: { "brandName": "$brand.name" } },
        {
          $project: {
            brandName: 1,
            products: { $slice: ["$products", 10] },
            _id: 0
          }
        }
      ])

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getById(productId: Types.ObjectId): Promise<Product> {
    try {
      const product = await this.productModel.findById(productId)
      return product;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateById(productId: Types.ObjectId, productDTO: ProductDTO): Promise<Record<string, any>> {
    try {
      await this.productModel.findByIdAndUpdate(productId, productDTO)
      return {
        statusCode: 200,
        message: "Cập nhật thông tin sản phẩm thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async toggleStatus(productId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      const current = await this.productModel.findById(productId)
      const result = await this.productModel.findByIdAndUpdate(productId,{
        status: !current.status 
      }, { new: true })
      return {
        statusCode: 200,
        message: `Sản phẩm ${(result.status) ? "đã được hiển thị" : "đã bị ẩn"}`
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteById(productId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      await this.productModel.findByIdAndUpdate(productId, {
        deletedAt: new Date()
      })
      return {
        statusCode: 200,
        message: "Xóa sản phẩm thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

}
