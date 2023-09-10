import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { ProductVersion } from "./schema/version.schema";
import { ProductVersionService } from "./version.service";
import { ProductVersionDTO, UpdateProductVersionDTO } from "./dto/version.dto";

@Controller("version")
export class ProductVersionController {
  constructor(private versionService: ProductVersionService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async createNew(
    @Body() versionDTO: ProductVersionDTO,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5000 * 1000 })
        .addFileTypeValidator({ fileType: /^image\/.*/ })
        .build({ 
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    ) files: Array<Express.Multer.File>
  ): Promise<Record<string, any>> {
    return this.versionService.createNew(versionDTO, files)
  }

  @Get("of-product")
  async getByProduct(@Query() queryParams: Record<string, any>): Promise<ProductVersion[]> {
    return this.versionService.getByProduct(queryParams)
  }

  @Get(':id')
  async getById(@Param('id') versionId: Types.ObjectId): Promise<ProductVersion> {
    return this.versionService.getById(versionId)
  } 

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async updateById(
    @Param('id') versionId: Types.ObjectId,
    @Body() versionDTO: UpdateProductVersionDTO,
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
    return this.versionService.updateById(versionId, versionDTO, files)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteById(@Param('id') versionId: Types.ObjectId): Promise<Record<string, any>> {
    return this.versionService.deleteById(versionId)
  }

  @Put('hide/:id')
  @UseGuards(AuthGuard)
  async toggleStatus(@Param('id') versionId: Types.ObjectId): Promise<Record<string, any>> {
    return this.versionService.toggleStatus(versionId)
  }
}