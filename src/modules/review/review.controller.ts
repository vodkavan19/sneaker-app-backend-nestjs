import { Body, Controller, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, UploadedFiles, UseInterceptors, Put, UseGuards } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { Review } from "./schema/review.schema";
import { ReviewService } from "./review.service";
import { FilterDTO, ReviewDTO, StatusDTO } from "./dto/review.dto";

@Controller("review")
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async createNew(
    @Body() reviewDTO: ReviewDTO,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5000 * 1000 })
        .addFileTypeValidator({ fileType: /^image\/.*/ })
        .build({ 
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    ) files?: Array<Express.Multer.File>
  ): Promise<Record<string, any>> {
    return this.reviewService.createNew(reviewDTO, files)
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(): Promise<Review[]> {
    return this.reviewService.getAll();
  }

  @Post('product/:id')
  async getReviewsByProduct(
    @Param('id') reviewId: Types.ObjectId,
    @Body() filterDTO: FilterDTO,
  ): Promise<Record<string, any>> {
    return this.reviewService.getReviewsByProduct(reviewId, filterDTO)
  }

  @Get('product/:id')
  async getOverviewByProduct(@Param('id') reviewId: Types.ObjectId): Promise<Record<string, any>> {
    return this.reviewService.getOverviewByProduct(reviewId)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async changeStatus(
    @Param('id') reviewId: Types.ObjectId,
    @Body() statusDTO: StatusDTO,
  ): Promise<Record<string, any>> {
    return this.reviewService.changeStatus(reviewId, statusDTO)
  }
}
