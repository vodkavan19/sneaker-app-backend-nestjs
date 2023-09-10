import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Product } from "src/modules/product/schema/product.schema";

export type ProductVersionDocument = HydratedDocument<ProductVersion>;

@Schema({ timestamps: true })
export class ProductVersion {

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop({ type: [{ type: Object }] })
  images: Array<{
    link: string; 
    path: string; 
  }>;

  @Prop({ type: [{ type: Object }] })
  sizes: Array<{ 
    sku: number;
    quantity: number;
  }>;

  @Prop({ required: true })
  status: boolean;

  @Prop()
  deletedAt: Date;
}

export const ProductVersionSchema = SchemaFactory.createForClass(ProductVersion);