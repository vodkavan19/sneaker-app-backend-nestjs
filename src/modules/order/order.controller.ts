import { Body, Controller, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { Order } from "./schema/order.schema";
import { OrderService } from "./order.service";
import { CancelOrderDTO, ConfirmOrderDTO, CreateOrderDTO, ItineraryDTO } from "./dto/order.dto";

@Controller("order")
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAll(): Promise<Order[]> {
    return this.orderService.getAll();
  };

  @Post()
  @UseGuards(AuthGuard)
  async createNew(@Body() createOrderDTO: CreateOrderDTO): Promise<Record<string, any>> {
    return this.orderService.createNew(createOrderDTO);
  };

  @Get("customer")
  @UseGuards(AuthGuard)
  async getByCustomer(@Query() queryParams: Record<string, any>): Promise<Order[]> {
    return this.orderService.getByCustomer(queryParams)
  }; 

  @Get("shipper/delivery")
  @UseGuards(AuthGuard)
  async getDeliveryOrderByShipper(@Query() queryParams: Record<string, any>): Promise<Order[]> {
    return this.orderService.getDeliveryOrderByShipper(queryParams)
  };

  @Get("shipper/success")
  @UseGuards(AuthGuard)
  async getSuccessOrderByShipper(@Query() queryParams: Record<string, any>): Promise<Order[]> {
    return this.orderService.getSuccessOrderByShipper(queryParams)
  }

  @Put('cancel/:id')
  @UseGuards(AuthGuard)
  async cancelOrderById(
    @Param('id') orderId: Types.ObjectId,
    @Body() cancelOrderDTO: CancelOrderDTO,
  ): Promise<Record<string, any>> {
    return this.orderService.cancelOrderById(orderId, cancelOrderDTO)
  }

  @Put('comfirm/:id')
  @UseGuards(AuthGuard)
  async confirmOneOrder(
    @Param('id') orderId: Types.ObjectId,
    @Body() confirmOrderDTO: ConfirmOrderDTO
  ): Promise<Record<string, any>> {
    return this.orderService.confirmOneOrder(orderId, confirmOrderDTO);
  }

  @Put('success/:id')
  @UseGuards(AuthGuard)
  async comfirmSuccess(@Param('id') orderId: Types.ObjectId): Promise<Record<string, any>> {
    return this.orderService.comfirmSuccess(orderId)
  }

  @Put('itinerary/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('proof'))
  async updateItinerary(
    @Param('id') orderId: Types.ObjectId,
    @Body() itineraryDTO: ItineraryDTO,
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
    return this.orderService.updateItinerary(orderId, itineraryDTO, file)
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(@Param('id') orderId: Types.ObjectId): Promise<Order> {
    return this.orderService.getById(orderId);
  }
}