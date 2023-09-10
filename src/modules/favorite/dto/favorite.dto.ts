import { IsNotEmpty, IsString } from "class-validator";

export class FavoriteDTO {
  @IsString()
  @IsNotEmpty()
  product: string; 

  @IsString()
  @IsNotEmpty()
  customer: string; 
}