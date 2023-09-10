import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min, isPositive } from "class-validator";
import { Transform } from "class-transformer";

export class ProductDTO {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsArray()
  @IsNotEmpty()
  category: string[];

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  discount: number;

  @IsPositive()
  @IsNotEmpty()
  sizeMin: number;

  @IsPositive()
  @IsNotEmpty()
  sizeMax: number;

  @IsOptional()
  gender: string[];

  @IsOptional()
  @IsString()
  description: string;
}

export class SearchDTO {
  
  @IsNotEmpty()
  limit: number;
  
  @IsNotEmpty()
  page: number;
  
  @IsString()
  @IsNotEmpty()
  sort: string;
  
  @IsString()
  @IsOptional()
  brand: string;
  
  @IsString()
  @IsOptional()
  category: string;
  
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  size: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  star: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  priceMin: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  priceMax: number;
}