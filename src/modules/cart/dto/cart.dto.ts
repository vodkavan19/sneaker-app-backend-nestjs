import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from "class-validator";

export class CartDTO {
  
  @IsString()
  @IsNotEmpty()
  customer: string;
  
  @IsString()
  @IsNotEmpty()
  product: string;
  
  @IsString()
  @IsNotEmpty()
  version: string;
  
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  size: number;
  
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

export class DeleteProductDTO {
  
  @IsString()
  @IsNotEmpty()
  customer: string;
  
  @IsString()
  @IsNotEmpty()
  product: string;
  
  @IsString()
  @IsNotEmpty()
  version: string;
  
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  size: number;

}