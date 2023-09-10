import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Order } from "./schema/order.schema";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { ProductVersion } from "../productVersion/schema/version.schema";
import { Product } from "../product/schema/product.schema";
import { Cart } from "../cart/schema/cart.schema";
import { CancelOrderDTO, ConfirmOrderDTO, CreateOrderDTO, ItineraryDTO } from "./dto/order.dto";
import { Review } from "../review/schema/review.schema";

@Injectable()
export class OrderService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Order.name) private orderModel: mongoose.Model<Order>,
    @InjectModel(Review.name) private reviewModel: mongoose.Model<Review>,
    @InjectModel(Cart.name) private cartModel: mongoose.Model<Cart>,
    @InjectModel(ProductVersion.name) private versionModel: mongoose.Model<ProductVersion>,
    @InjectModel(Product.name) private productModel: mongoose.Model<Product>
  ) { }

  async getAll(): Promise<Order[]> {
    try {
      const orders = await this.orderModel.find()
        .populate('customer')
        .populate('address')
        .populate({
          path: 'products',
          populate: { path: '_id', select: 'name' }
        })
        .populate({
          path: 'products',
          populate: { path: 'version', select: 'name' }
        })

      return orders;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getById(orderId: Types.ObjectId): Promise<Order> {
    try {
      const order = await this.orderModel.findById(orderId)
        .populate('customer')
        .populate('address')
        .populate('shipper')
        .populate({
          path: 'products',
          populate: { path: '_id', select: 'name price discount status isDeleted' }
        })
        .populate({
          path: 'products',
          populate: { path: 'version', select: 'name images sizes status isDeleted' }
        });

      var products = [];
      for (let i = 0; i < order.products.length; i++) {
        var item = order.products[i];
        var reviewData = await this.reviewModel.findOne({
          product: item._id,
          customer: order.customer,
          order: order,
          version: item.version,
          size: item.size,
        })
        products[i] = { ...item.toObject(), review: reviewData };
      }

      const result = { ...order.toObject(), products: products }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async createNew(dto: CreateOrderDTO): Promise<Record<string, any>> {
    try {
      const cart = await this.cartModel.findOne({
        customer: dto.customer
      })
        .populate({
          path: 'products',
          populate: { path: '_id', select: 'price discount sold' }
        })
        .populate({
          path: 'products',
          populate: { path: 'version', select: 'sizes' }
        });

      if (cart.products.length != 0) {
        const order = await this.orderModel.create({
          ...dto,
          products: [],
          itinerary: [{
            title: "Đặt hàng thành công",
            time: new Date(),
            caption: "Đơn hàng đã được đặt thành công và chuyển cho bộ phận xác nhận đơn"
          }]
        });

        for (let element of cart.products) {
          var inventoryQuantity = element.version.sizes.find(
            (size) => size.sku === element.size
          ).quantity;

          if (inventoryQuantity > 0) {
            await this.orderModel.findOneAndUpdate({
              _id: order._id
            }, {
              $push: {
                products: {
                  _id: element._id,
                  version: element.version,
                  size: element.size,
                  quantity: element.quantity,
                  price: element._id.price,
                  discount: element._id.discount,
                }
              }
            });

            await this.cartModel.findOneAndUpdate({
              customer: dto.customer
            }, {
              $pull: {
                products: {
                  _id: element._id,
                  version: element.version,
                  size: element.size,
                }
              }
            });

            const newCount = inventoryQuantity - element.quantity;
            await this.versionModel.findByIdAndUpdate(element.version, {
              "$set": {
                ["sizes.$[item].quantity"]: newCount
              }
            }, {
              "arrayFilters": [{
                "item.sku": element.size
              }]
            })

            await this.productModel.findByIdAndUpdate(
              element._id,
              { $inc: { sold: element.quantity } },
              { new: true }
            )
          }
        }

        return {
          statusCode: 200,
          message: "Thêm đơn hàng thành công!"
        }
      } else {
        throw new HttpException('Có lỗi xảy ra khi thêm đơn hàng!', HttpStatus.BAD_REQUEST)
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getByCustomer(queryParams: Record<string, any>): Promise<Order[]> {
    try {
      const orders = await this.orderModel.find({
        customer: new Types.ObjectId(queryParams.customer)
      })
        .populate({
          path: 'products',
          populate: { path: '_id', select: 'name price discount status isDeleted' }
        })
        .populate({
          path: 'products',
          populate: { path: 'version', select: 'name images sizes status isDeleted' }
        })
        .sort({ createdAt: 'desc' })
      return orders;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getDeliveryOrderByShipper(queryParams: Record<string, any>): Promise<Order[]> {
    try {
      const orders = await this.orderModel.aggregate([
        {
          $match: {
            $and: [
              { shipper: { $eq: new Types.ObjectId(queryParams.shipper) } },
              { status: { $eq: 'delivery' } },
              { successProof: { $in: [null, ''] } }
            ]
          }
        },
        {
          $lookup: {
            from: 'customeraddresses',
            localField: 'address',
            foreignField: '_id',
            as: 'address'
          }
        },
        {
          $sort: {
            "createdAt": -1,
          }
        }
      ]).unwind('address')
      return orders;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getSuccessOrderByShipper(queryParams: Record<string, any>): Promise<Order[]> {
    try {
      const orders = await this.orderModel.aggregate([
        {
          $match: {
            $and: [
              { shipper: { $eq: new Types.ObjectId(queryParams.shipper) } },
              { status: { $in: ['delivery', 'success'] } },
              { successProof: { $nin: [null, ''] } }
            ]
          }
        },
        {
          $lookup: {
            from: 'customeraddresses',
            localField: 'address',
            foreignField: '_id',
            as: 'address'
          }
        },
        {
          $addFields: {
            "successTime": { $last: "$itinerary.time" }
          }
        },
        {
          $sort: {
            "successTime": -1,
          }
        }
      ]).unwind('address');
      return orders;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async cancelOrderById(orderId: Types.ObjectId, cancelOrderDTO: CancelOrderDTO): Promise<Record<string, any>> {
    try {
      const order = await this.orderModel.findByIdAndUpdate(orderId, {
        $set: {
          status: 'cancel',
        },
        $push: {
          itinerary: {
            title: "Đơn hàng đã bị hủy",
            time: new Date(),
            caption: `Lý do hủy: ${cancelOrderDTO.partian} - ${cancelOrderDTO.reason}`
          }
        }
      }, { new: true })
        .populate({
          path: 'products',
          populate: { path: 'version', select: 'sizes' }
        });

      for (const element of order.products) {
        var inventoryQuantity = element.version.sizes.find(
          (size) => size.sku === element.size
        ).quantity;

        const newCount = inventoryQuantity + element.quantity;
        await this.versionModel.findByIdAndUpdate(element.version, {
          "$set": {
            ["sizes.$[item].quantity"]: newCount
          }
        }, {
          "arrayFilters": [{
            "item.sku": element.size
          }]
        })

        await this.productModel.findByIdAndUpdate(
          element._id,
          { $inc: { sold: -(element.quantity) } },
          { new: true }
        )
      }

      return {
        statusCode: 200,
        message: "Hủy đơn hàng thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async confirmOneOrder(orderId: Types.ObjectId, confirmOrderDTO: ConfirmOrderDTO): Promise<Record<string, any>> {
    try {
      await this.orderModel.findOneAndUpdate({
        _id: orderId
      }, {
        $set: {
          status: 'delivery',
          shipper: confirmOrderDTO.shipper,
        },
        $push: {
          itinerary: {
            title: "Hoàn tất đóng gói",
            time: new Date(),
            caption: 'Kiện hàng đã hoàn tất đóng gói và sẵn sàng cho quá trình vận chuyển'
          }
        }
      })
      return {
        statusCode: 200,
        message: "Xác nhận đã xử lý đơn hàng thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async comfirmSuccess(orderId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      await this.orderModel.findByIdAndUpdate(orderId, { status: 'success' })
      return {
        statusCode: 200,
        message: 'Thành công! Đơn hàng đã hoàn tất.'
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateItinerary(orderId: Types.ObjectId, itineraryDTO: ItineraryDTO, file: Express.Multer.File): Promise<Record<string, any>> {
    const proof = file
      ? await this.cloudinaryService.uploadSingleFile(file, 'sneakerapp/deliveryProof')
      : undefined

    try {
      if (itineraryDTO.title === 'Giao hàng thành công' && proof === undefined) {
        throw new HttpException(
          'Vui lòng cung cấp bằng chứng giao hàng thành công!', 
          HttpStatus.BAD_REQUEST
        )
      }

      await this.orderModel.findOneAndUpdate({
        _id: orderId
      }, {
        $set: {
          successProof: proof || {},
        },
        $push: {
          itinerary: {
            title: itineraryDTO.title,
            time: new Date(),
            caption: itineraryDTO.caption
          }
        }
      })

      return {
        statusCode: 200,
        message: 'Cập nhật hành trình giao hàng thành công!'
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}