import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, min } from "class-validator";

export class ReviewDTO {
  @IsString()
  @IsNotEmpty()
  customer: string;
  
  @IsString()
  @IsNotEmpty()
  product: string;
  
  @IsString()
  @IsNotEmpty()
  version: string;
  
  @IsString()
  @IsNotEmpty()
  order: string;
  
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  size: number;

  @IsInt()
  @Min(0)
  @Max(5)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  rating: number; 

  @IsString()
  @IsOptional()
  content: string;
}

export class FilterDTO {
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  page: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  limit: number;

  @IsBoolean()
  @IsOptional()
  content: boolean;

  @IsBoolean()
  @IsOptional()
  images: boolean;

  @IsArray()
  @IsNotEmpty()
  star: number[];
}

export class StatusDTO {
  @IsString()
  @IsNotEmpty()
  status: string;
}