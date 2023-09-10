import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BrandDocument = HydratedDocument<Brand>;

@Schema({ timestamps: true })
export class Brand {
  
  @Prop({ type: Object })
  logo: { link: string; path: string };

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ required: true })
  status: boolean;

  @Prop()
  deletedAt: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);