import { IsString, IsArray, IsNumber, ValidateNested, IsNotEmpty, IsInt, Min, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class DetailDTO {
  @IsString()
  @IsNotEmpty()
  version: string;

  @IsPositive()
  @IsNotEmpty()
  size: number;

  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}

class ProductDTO {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailDTO)
  detail: DetailDTO[];
}

export class createImportDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  warehouse: string;

  @IsString()
  @IsNotEmpty()
  supplier: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  employee: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDTO)
  products: ProductDTO[];

}
