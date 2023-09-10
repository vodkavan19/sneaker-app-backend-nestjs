import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { Brand } from "./schema/brand.schema";
import { BrandDTO } from "./dto/brand.dto";
import { BrandServices } from "./brand.service";

@Controller('brand')
export class BrandController {
  constructor(private brandServices: BrandServices) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllPrivate(): Promise<Brand[]> {
    return this.brandServices.getAllPrivate();
  }

  @Get('public')
  async getAllPublic(): Promise<Brand[]> {
    return this.brandServices.getAllPublic();
  }

  @Get(':slug')
  async getOneBySlug(@Param('slug') brandSlug: string): Promise<Brand> {
    return this.brandServices.getOneBySlug(brandSlug)
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('logo'))
  async createNew(
    @Body() brandDTO: BrandDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5000 * 1000 })
        .addFileTypeValidator({ fileType: /^image\/.*/ })
        .build({ 
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    ) file?: Express.Multer.File,
  ): Promise<Record<string, any>> {
    return this.brandServices.createNew(brandDTO, file)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('logo'))
  async updateById(
    @Param('id') brandId: Types.ObjectId,
    @Body() brandDTO: BrandDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5000 * 1000 })
        .addFileTypeValidator({ fileType: /^image\/.*/ })
        .build({ 
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    ) file?: Express.Multer.File,
  ):  Promise<Record<string, any>> {
    return this.brandServices.updateById(brandId, brandDTO, file);
  }

  @Put('hide/:id')
  @UseGuards(AuthGuard)
  async toggleStatus(@Param('id') brandId: Types.ObjectId): Promise<Record<string, any>> {
    return this.brandServices.toggleStatus(brandId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteById(@Param('id') brandId: Types.ObjectId): Promise<Record<string, any>> {
    return this.brandServices.deleteById(brandId)
  }
}