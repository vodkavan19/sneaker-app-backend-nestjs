import { IsNotEmpty, IsString } from "class-validator";

export class CategoryDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}