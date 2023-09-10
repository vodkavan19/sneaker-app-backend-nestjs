import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Customer } from "src/modules/customer/schema/customer.schema";
import { Order } from "src/modules/order/schema/order.schema";
import { Product } from "src/modules/product/schema/product.schema";
import { ProductVersion } from "src/modules/productVersion/schema/version.schema";

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' })
  customer: Customer;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductVersion' })
  version: ProductVersion;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  order: Order;

  @Prop({ required: true, min: 0 })
  size: number;
  
  @Prop({ required: true, min: 0, max: 5 })
  rating: number;

  @Prop({ trim: true })
  content: string;

  @Prop({ required: true })
  status: string

  @Prop([
    {
      link: { type: String, required: true },
      path: { type: String, required: true }
    }
  ])
  images: Array<{
    link: string;
    path: string;
  }>;

}

export const ReviewSchema = SchemaFactory.createForClass(Review);