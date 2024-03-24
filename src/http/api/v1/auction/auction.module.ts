import { Global, Module } from '@nestjs/common';
import { AuctionController } from './controllers/auction.controllers';
import { AuctionService } from './services/auction.service';
import { AppLogger } from 'src/shared/utils/logger.utils';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { UsersService } from '../users/services/users.service';

const providers = [AuctionService];

@Module({
  imports: [SharedModule, AuthModule, JwtModule.register({})],
  controllers: [AuctionController],
  providers: [...providers, AppLogger, PrismaService, UsersService],
  exports: providers,
})
@Global()
export class AuctionModule {}
