import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { Product } from "../product/schema/product.schema";
import { Order } from "../order/schema/order.schema";
import { Customer } from "../customer/schema/customer.schema";
import { Import } from "../import/schema/import.schema";
import { Employee } from "../employee/schema/employee.schema";
import { BestSellerDTO, OrderByDateDTO } from "./dto/dashboard.dto";

Injectable()
export class DashboardService {
  private time: number

  constructor(
    @InjectModel(Product.name) private productModel: mongoose.Model<Product>,
    @InjectModel(Order.name) private orderModel: mongoose.Model<Order>,
    @InjectModel(Customer.name) private customerModel: mongoose.Model<Customer>,
    @InjectModel(Import.name) private importModel: mongoose.Model<Import>,
    @InjectModel(Employee.name) private empoyeeModel: mongoose.Model<Employee>
  ) {
    this.time = 1000 * 60 * 60 * 24 * 7;
  }

  async getCountProduct(): Promise<Record<string, any>> {
    try {
      const count = await this.productModel.find({ deletedAt: null }).count()
      var countInWeek = await this.orderModel.aggregate([
        {
          $match: {
            $and: [
              { createdAt: { $gte: new Date(new Date().getTime() - this.time) } },
              { status: { $ne: 'cancel' } },
            ]
          }
        },
        { $project: { products: 1, createdAt: 1 } },
        { $unwind: '$products' },
        {
          $group: {
            _id: '$quantity',
            count: { $sum: 1 }
          }
        }
      ])

      countInWeek = (countInWeek.length !== 0 ? countInWeek[0].count : 0)
      return {
        total: count,
        inWeek: countInWeek
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getCountCustomer(): Promise<Record<string, any>> {
    try {
      const count = await this.customerModel.find().count()
      const countInWeek = await this.customerModel.find({
        createdAt: { $gte: new Date(new Date().getTime() - this.time) }
      }).count()
      return {
        total: count,
        inWeek: countInWeek
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getCountOrder(): Promise<Record<string, any>> {
    try {
      const count = await this.orderModel.find().count()
      const countInWeek = await this.orderModel.find({
        createdAt: { $gte: new Date(new Date().getTime() - this.time) }
      }).count()

      const totalReveneu = await this.orderModel.aggregate([
        { $match: { status: 'success' } },
        {
          $group: {
            _id: null,
            count: { $sum: "$total" }
          }
        },
      ])

      const totalWaitRevenue = await this.orderModel.aggregate([
        {
          $match: {
            $and: [
              { status: { $eq: 'delivery' } },
              { successProof: { $nin: [null, ''] } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: "$total" }
          }
        },
      ])

      return {
        count: { total: count, inWeek: countInWeek },
        revenue: totalReveneu[0]?.count || 0,
        waitRevenue: totalWaitRevenue[0]?.count || 0
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async countProductByBrand(): Promise<Record<string, any>[]> {
    try {
      const result = await this.productModel.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: "$brand",
            count: { $sum: 1 }
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
        { $unwind: '$brand' },
        { $addFields: { "brandName": "$brand.name" } },
        { $project: { "brandName": 1, count: 1 } },
        { $sort: { count: -1 } }
      ])

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async statisticImport(): Promise<Record<string, any>[]> {
    try {
      const countQuantity = await this.importModel.aggregate([
        { $unwind: "$products" },
        {
          $addFields: {
            "detail": "$products.detail",
          }
        },
        { $project: { "detail": 1, "createdAt": 1, "total": 1 } },
        { $unwind: "$detail" },
        {
          $group: {
            _id: '$createdAt',
            quantity: { $sum: "$detail.quantity" },
            totalMoney: { $first: "$total" }
          }
        },
        {
          $project: {
            date: { $dateToString: { date: "$_id" } },
            quantity: 1,
            totalMoney: 1,
            _id: 0
          }
        },
        { $sort: { date: 1 } },
        { $limit: 10 }
      ])

      return countQuantity
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async countOrderByDate(bodyDTO: OrderByDateDTO): Promise<Record<string, any>[]> {
    try {
      const start = new Date(bodyDTO.start)
      const end = new Date(bodyDTO.end)
      let boundaries = [start]
      while (boundaries.slice(-1)[0] <= end) {
        boundaries.push(
          new Date(
            new Date(
              boundaries.slice(-1)[0]).getTime()
            + (1000 * 60 * 60 * 24 * bodyDTO.step)
          )
        )
      }

      const result = await this.orderModel.aggregate([
        {
          $match: {
            $and: [
              { status: { $ne: 'cancel' } },
              { createdAt: { $gte: start, $lte: end } }
            ]
          }
        },
        {
          $bucket: {
            boundaries: boundaries,
            groupBy: "$createdAt",
            output: {
              count: { $sum: 1 },
              amount: { $sum: "$total" },
            }
          }
        },
        {
          $densify: {
            field: "_id",
            range: {
              step: bodyDTO.step,
              unit: "day",
              bounds: [start, end],
            }
          }
        },
        {
          $project: {
            date: { $dateToString: { date: "$_id" } },
            count: { $ifNull: ["$count", 0] },
            totalMoney: { $ifNull: ["$amount", 0] },
            _id: 0,
          }
        },
      ])

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async potentialCustomer(): Promise<Record<string, any>[]> {
    try {
      const result = await this.orderModel.aggregate([
        { $match: { status: { $ne: 'cancel' } } },
        {
          $group: {
            _id: "$customer",
            countOrder: { $sum: 1 }
          }
        },
        { $sort: { countOrder: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'customers',
            localField: '_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: "$customer" },
        { $project: { _id: 0 } }
      ])

      return result
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async bestSellerProduct(bodyDTO: BestSellerDTO): Promise<Record<string, any>[]> {
    try {
      const result = await this.productModel.find({ deletedAt: null })
        .populate({
          path: 'versions',
          match: { deletedAt: null },
          select: 'images name',
        })
        .populate({ path: 'brand', select: 'name' })
        .sort({ sold: 'desc' })
        .limit(bodyDTO.limit);

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async countEmployee(): Promise<Record<string, any>[]> {
    try {
      const result = await this.empoyeeModel.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}