import { Global, Module } from '@nestjs/common';
import { AuctionController } from './controllers/auction.controllers';
import { AuctionService } from './services/auction.service';
import { AppLogger } from 'src/shared/utils/AppLogger';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

const providers = [AuctionService];

@Module({
  imports: [SharedModule, AuthModule, JwtModule.register({})],
  controllers: [AuctionController],
  providers: [...providers, AppLogger],
  exports: providers,
})
@Global()
export class AuctionModule {}
