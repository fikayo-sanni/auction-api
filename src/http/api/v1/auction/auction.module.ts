import { Global, Module } from '@nestjs/common';
import { AuctionController } from './controllers/auction.controllers';
import { AuctionService } from './services/auction.service';

const providers = [AuctionService];

@Module({
  controllers: [AuctionController],
  providers,
  exports: providers,
})
@Global()
export class AuctionModule {}
