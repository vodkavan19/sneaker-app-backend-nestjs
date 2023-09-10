import { Body, Controller, Get, Post, Put, Query, UseGuards } from "@nestjs/common";

import { AuthGuard } from "src/guard/auth.guard";
import { CartService } from "./cart.service";
import { CartDTO, DeleteProductDTO } from "./dto/cart.dto";

@Controller("cart")
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getByUser(@Query() queryParams: Record<string, any>): Promise<Record<string, any>> {
    return this.cartService.getByUser(queryParams)
  }

  @Post()
  @UseGuards(AuthGuard)
  async addToCart(@Body() cartDTO: CartDTO): Promise<Record<string, any>> {
    return this.cartService.addToCart(cartDTO)
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateQuantity(@Body() cartDTO: CartDTO): Promise<Record<string, any>> {
    return this.cartService.updateQuantity(cartDTO)
  }

  @Put('deleted')
  @UseGuards(AuthGuard)
  async deleteProduct(@Body() deleteProdutDTO: DeleteProductDTO): Promise<Record<string, any>> {
    return this.cartService.deleteProduct(deleteProdutDTO)
  }
}