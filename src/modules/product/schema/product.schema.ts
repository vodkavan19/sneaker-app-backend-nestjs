import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Brand } from "src/modules/brand/schema/brand.schema";
import { Category } from "src/modules/category/schema/category.schema";

export type ProductDocument = HydratedDocument<Product>;

@Schema({ 
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true},  
})
export class Product {

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' })
  brand: Brand;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  category: Category[];

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0, max: 100 })
  discount: number;

  @Prop({ required: true, min: 0 })
  sold: number;

  @Prop({ required: true, min: 0, max: 0 })
  star: number;

  @Prop({ required: true })
  sizeMin: number;

  @Prop({ required: true })
  sizeMax: number;

  @Prop([String])
  gender: string[];

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  status: boolean;

  @Prop()
  deletedAt: Date;

}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('versions', {
  ref: 'ProductVersion',
  localField: '_id',
  foreignField: 'product',
})
