import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { ProductVersion } from "../productVersion/schema/version.schema";
import { Cart } from "./schema/cart.schema";
import { CartDTO, DeleteProductDTO } from "./dto/cart.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(ProductVersion.name) private versionModel: mongoose.Model<ProductVersion>,
    @InjectModel(Cart.name) private cartModel: mongoose.Model<Cart>
  ) { }

  async getByUser(queryParams: Record<string, any>): Promise<Record<string, any>> {
    try {
      var total = 0;
      var inventory = [];
      var inventoryCount = 0
      var soldout = [];

      const cart = await this.cartModel.findOne({ customer: queryParams.customer })
        .populate('customer')
        .populate({
          path: 'products',
          populate: { path: '_id', select: 'name price discount' }
        })
        .populate({
          path: 'products',
          populate: { path: 'version', select: 'name images sizes' }
        })

      const count = cart.products.reduce(
        (count, product) => count + product.quantity, 0
      );

      cart.products.forEach(product => {
        var inventoryQuantity = product.version.sizes.find(
          (size) => size.sku === product.size
        ).quantity;

        if (inventoryQuantity > 0) {
          inventory.push({
            ...product.toObject(),
            inventoryQuantity: inventoryQuantity
          })
        } else {
          soldout.push(product)
        }
      })

      inventory.forEach(product => {
        var discountPrice = product._id.price -
          (product._id.price * (product._id.discount / 100));
        total += discountPrice * product.quantity;
        inventoryCount += product.quantity;
      })

      return {
        count: count,
        total: total,
        inventory: inventory,
        inventoryCount: inventoryCount,
        soldout: soldout,
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async addToCart(cartDTO: CartDTO): Promise<Record<string, any>> {
    try {
      const cartOfCustomer = await this.cartModel.findOne({
        customer: new Types.ObjectId(new Types.ObjectId(cartDTO.customer)),
      })
      if (cartOfCustomer == null) {
        await this.cartModel.create({
          customer: new Types.ObjectId(new Types.ObjectId(cartDTO.customer)),
          products: [{
            _id: new Types.ObjectId(cartDTO.product),
            version: new Types.ObjectId(cartDTO.version),
            size: cartDTO.size,
            quantity: cartDTO.quantity,
          }]
        })
      } else {
        const productOfCart = await this.cartModel.aggregate([
          { $unwind: '$products' },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$customer", new Types.ObjectId(cartDTO.customer)] },
                  { $eq: ["$products._id", new Types.ObjectId(cartDTO.product)] },
                  { $eq: ["$products.version", new Types.ObjectId(cartDTO.version)] },
                  { $eq: ["$products.size", cartDTO.size] },
                ]
              }
            }
          }
        ]);

        if (productOfCart.length == 0) {
          await this.cartModel.findOneAndUpdate(
            { customer: new Types.ObjectId(cartDTO.customer) },
            {
              $push: {
                products: {
                  _id: new Types.ObjectId(cartDTO.product),
                  version: new Types.ObjectId(cartDTO.version),
                  size: cartDTO.size,
                  quantity: cartDTO.quantity
                }
              }
            }
          )
        } else {
          const productCurrent = productOfCart.filter(element =>
            element.products._id == cartDTO.product
            && element.products.version == cartDTO.version
            && element.products.size == cartDTO.size
          )[0]

          const count = cartDTO.quantity + productCurrent.products.quantity;

          const version = await this.versionModel.aggregate([{
            $match: { _id: new Types.ObjectId(cartDTO.version) }
          }]).unwind('sizes');
          const currentVersion = version.find(element => element.sizes.sku == cartDTO.size)

          if (count > currentVersion.sizes.quantity) {
            throw new HttpException(
              `chỉ có thể đặt mua tối đa ${currentVersion.sizes.quantity} sản phẩm`,
              HttpStatus.BAD_REQUEST
            )
          }

          await this.cartModel.findOneAndUpdate({
            customer: new Types.ObjectId(cartDTO.customer)
          }, {
            "$set": {
              ["products.$[element].quantity"]: count
            }
          }, {
            "arrayFilters": [{
              "element._id": new Types.ObjectId(cartDTO.product),
              "element.version": cartDTO.version,
              "element.size": cartDTO.size,
            }]
          })
        }
      }

      const cart = await this.cartModel.findOne({ customer: new Types.ObjectId(cartDTO.customer) });
      const countProductOfCart = cart.products.reduce(
        (count, product) => count + product.quantity, 0
      );

      return {
        count: countProductOfCart,
        message: 'Thêm giỏ hàng thành công!'
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateQuantity(cartDTO: CartDTO): Promise<Record<string, any>> {
    try {
      await this.cartModel.findOneAndUpdate({
        customer: new Types.ObjectId(cartDTO.customer)
      }, {
        "$set": {
          ["products.$[element].quantity"]: cartDTO.quantity
        }
      }, {
        "arrayFilters": [{
          "element._id": new Types.ObjectId(cartDTO.product),
          "element.version": new Types.ObjectId(cartDTO.version),
          "element.size": cartDTO.size,
        }]
      })
      return {
        statusCode: 200,
        message: 'Cập nhật giỏ hàng thành công!'
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteProduct(delDTO: DeleteProductDTO): Promise<Record<string, any>> {
    try {
      await this.cartModel.findOneAndUpdate({
        customer: new Types.ObjectId(delDTO.customer)
      }, {
        $pull: {
          products: {
            _id: new Types.ObjectId(delDTO.product),
            version: new Types.ObjectId(delDTO.version),
            size: delDTO.size,
          }
        }
      })

      const cart = await this.cartModel.findOne({ customer: delDTO.customer });
      const countProductOfCart = cart.products.reduce(
        (count, product) => count + product.quantity, 0
      );

      return {
        count: countProductOfCart,
        message: 'Xóa sản phẩm khỏi giỏ hàng thành công!'
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}