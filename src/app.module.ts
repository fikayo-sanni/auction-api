import { Module } from '@nestjs/common';
import { UsersModule } from './http/api/v1/users/users.module';
import { AuthModule } from './http/api/v1/auth/auth.module';
import { AuctionModule } from './http/api/v1/auction/auction.module';

@Module({
  imports: [UsersModule, AuthModule, AuctionModule],
})
export class AppModule {}
