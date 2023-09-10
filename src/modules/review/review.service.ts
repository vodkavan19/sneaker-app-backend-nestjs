import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Product } from "../product/schema/product.schema";
import { Review } from "./schema/review.schema";
import { FilterDTO, ReviewDTO, StatusDTO } from "./dto/review.dto";

@Injectable()
export class ReviewService {
  constructor(
    private cloudinaryService: CloudinaryService,
    @InjectModel(Product.name) private productModel: mongoose.Model<Product>,
    @InjectModel(Review.name) private reviewModel: mongoose.Model<Review>
  ) { }

  async createNew(reviewDTO: ReviewDTO, files: Array<Express.Multer.File>): Promise<Record<string, any>> {
    const images = await this.cloudinaryService.uploadArrayFiles(files, 'sneakerapp/review')
    try {
      await this.reviewModel.create({ ...reviewDTO, images: images, status: 'new' })
      return {
        statusCode: 200,
        message: "Gửi đánh giá thành công!"
      }
    } catch (error) {
      images.forEach(image => this.cloudinaryService.deleteFile(image.path))
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAll(): Promise<Review[]> {
    try {
      const reviews = await this.reviewModel.find()
        .populate({ path: 'product', select: 'name' })
        .populate({ path: 'version', select: 'images name' })
        .populate({ path: 'customer', select: 'name email' })
      return reviews;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getReviewsByProduct(reviewId: Types.ObjectId, dto: FilterDTO): Promise<Record<string, any>> {
    try {
      const params = {
        product: new Types.ObjectId(reviewId),
        status: 'allow'
      }
      if (dto.content) params['content'] = { $nin: [null, ''] }
      if (dto.images) params['images'] = { $exists: true, $type: 'array', $ne: [] }
      if (dto.star.length != 0) params['rating'] = { $in: dto.star };

      const totalResult = await this.reviewModel.find(params).count();
      const result = await this.reviewModel.find(params)
        .populate({ path: 'customer', select: 'name avatar' })
        .populate({ path: 'version', select: 'name' })
        .sort('-createdAt')
        .skip((dto.page - 1) * dto.limit)
        .limit(dto.limit);

      return {
        data: result,
        pagination: {
          page: dto.page,
          limit: dto.limit,
          total: totalResult,
        }
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getOverviewByProduct(reviewId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      const params = {
        product: new Types.ObjectId(reviewId),
        status: 'allow'
      }

      const total = await this.reviewModel.find(params).count();
      const totalByLevels = await this.reviewModel.aggregate([
        {
          $match: {
            $and: [
              { status: 'allow' },
              { product: new Types.ObjectId(reviewId) }
            ]
          }
        },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      for (let level = 1; level <= 5; level++) {
        const isExist = totalByLevels.find(e => e._id === level);
        if (!isExist) totalByLevels.splice(level - 1, 0, { _id: level, count: 0 });
      }

      return {
        total: total,
        totalByLevels: totalByLevels.reverse()
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changeStatus(reviewId: Types.ObjectId, statusDTO: StatusDTO): Promise<Record<string, any>> {
    try {
      const review = await this.reviewModel.findByIdAndUpdate(reviewId, {
        status: statusDTO.status
      }, { new: true })

      const avgRating = await this.reviewModel.aggregate([
        {
          $match: {
            $and: [
              { status: 'allow' },
              { product: review.product }
            ]
          }
        },
        {
          $group: {
            _id: "$product",
            avg: { $avg: "$rating" }
          }
        },
      ])

      if (avgRating.length != 0) {
        await this.productModel.findByIdAndUpdate(
          review.product,
          { star: parseFloat(avgRating[0].avg.toFixed(1)) }
        )
      } else {
        await this.productModel.findByIdAndUpdate(
          review.product,
          { star: 0 }
        )
      }

      return {
        statusCode: 200,
        message: "Cập nhật trạng thái đánh giá thành công!"
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}