import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { Product } from "./schema/product.schema";
import { ProductDTO, SearchDTO } from "./dto/product.dto";
import { Types } from "mongoose";
import { AuthGuard } from "src/guard/auth.guard";

@Controller("product")
export class ProductController {
  constructor(private productService: ProductService) {}
  
  @Post()
  @UseGuards(AuthGuard)
  async createNew(@Body() productDTO: ProductDTO): Promise<Record<string, any>> {
    return this.productService.createNew(productDTO)
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(): Promise<Product[]> {
    return this.productService.getAll()
  }

  @Get("name")
  async getAllName(): Promise<Record<string, any>[]> {
    return this.productService.getAllName()
  }

  @Get("search")
  async search(@Query() queryParams: Record<string, any>): Promise<Product[]> {
    return this.productService.search(queryParams)
  }

  @Post("search")
  async getOnePage(@Body() searchDTO: SearchDTO): Promise<Record<string, any>> {
    return this.productService.getOnePage(searchDTO)
  }

  @Get("same-brand")
  async getSimilarByBrand(@Query() queryParams: Record<string, any>): Promise<Product[]> {
    return this.productService.getSimilarByBrand(queryParams)
  }

  @Get("best-seller")
  async getBestSeller(@Query() queryParams: Record<string, any>): Promise<Product[]> {
    return this.productService.getBestSeller(queryParams)
  }

  @Get("distribute-brand")
  async distributeByBrand(): Promise<Product[]> {
    return this.productService.distributeByBrand()
  }

  @Get(':id')
  async getById(@Param('id') productId: Types.ObjectId): Promise<Product> {
    return this.productService.getById(productId)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateById(
    @Param('id') productId: Types.ObjectId, 
    @Body() productDTO: ProductDTO
  ): Promise<Record<string, any>> {
    return this.productService.updateById(productId, productDTO)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteById(@Param('id') productId: Types.ObjectId): Promise<Record<string, any>> {
    return this.productService.deleteById(productId)
  }

  @Put('hide/:id')
  @UseGuards(AuthGuard)
  async toggleStatus(@Param('id') productId: Types.ObjectId): Promise<Record<string, any>> {
    return this.productService.toggleStatus(productId)
  }
}