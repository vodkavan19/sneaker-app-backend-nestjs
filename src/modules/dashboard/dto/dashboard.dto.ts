import { IsNotEmpty, IsPositive } from "class-validator";

export class OrderByDateDTO {
  @IsPositive()
  @IsNotEmpty()
  start: number;
  
  @IsPositive()
  @IsNotEmpty()
  end: number;
  
  @IsPositive()
  @IsNotEmpty()
  step: number;
}

export class BestSellerDTO {
  @IsPositive()
  @IsNotEmpty()
  limit: number
}