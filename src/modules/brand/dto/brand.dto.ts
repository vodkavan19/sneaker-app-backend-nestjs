import { IsNotEmpty, IsString } from "class-validator";

export class BrandDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}