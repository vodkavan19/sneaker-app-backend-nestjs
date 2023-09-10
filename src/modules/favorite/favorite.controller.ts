import { Body, Controller, Get, Post, Put, Query, UseGuards } from "@nestjs/common";
import { Product } from "../product/schema/product.schema";
import { FavoriteService } from "./favorite.service";
import { FavoriteDTO } from "./dto/favorite.dto";
import { AuthGuard } from "src/guard/auth.guard";

@Controller("favorite")
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllByCustomer(@Query() queryParams: Record<string, any>): Promise<Product[]> {
    return this.favoriteService.getAllByCustomer(queryParams)
  }

  @Post()
  @UseGuards(AuthGuard)
  async toggleFavorite(@Body() favoriteDTO: FavoriteDTO): Promise<Record<string, any>> {
    return this.favoriteService.toggleFavorite(favoriteDTO)
  }
}