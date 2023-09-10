import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from "class-validator";

export class CreateOrderDTO {
  @IsString()
  @IsNotEmpty()  
  customer: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsInt()
  @IsNotEmpty()
  deliveryMethodId: number;

  @IsString()
  @IsNotEmpty()
  deliveryMethod: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  estimatedTime: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  shippingFee: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  total: number;

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class CancelOrderDTO {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  partian: string;
}

export class ConfirmOrderDTO {
  @IsString()
  @IsNotEmpty()
  shipper: string
}

export class ItineraryDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  caption: string;
}