import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';

import { EmployeeModule } from './modules/employee/employee.module';
import { RegionModule } from './modules/region/region.module';
import { CustomerModule } from './modules/customer/customer.module';
import { CustomerAddressModule } from './modules/addressCustomer/address.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { ProductVersionModule } from './modules/productVersion/version.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { ReviewModule } from './modules/review/review.module';
import { ImportModule } from './modules/import/import.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        transport: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD
          }
        },
        defaults: {
          from: '"Sneaker Shop" <no-reply@support.thesneak.com>',
        },
      }),
    }),
    EmployeeModule,
    CustomerModule,
    CustomerAddressModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    ProductVersionModule,
    CartModule,
    OrderModule,
    ReviewModule,
    ImportModule,
    FavoriteModule,
    RegionModule,
    ShippingModule,
    DashboardModule
  ],
})
export class AppModule {}
