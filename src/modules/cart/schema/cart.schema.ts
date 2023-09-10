import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Customer } from "src/modules/customer/schema/customer.schema";
import { Product } from "src/modules/product/schema/product.schema";
import { ProductVersion } from "src/modules/productVersion/schema/version.schema";

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' })
  customer: Customer;

  @Prop([
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      version: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVersion' },
      size: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ])
  products: Array<{
    [x: string]: any;
    _id: Product;
    version: ProductVersion;
    size: number;
    quantity: number;
  }>

}

export const CartSchema = SchemaFactory.createForClass(Cart);