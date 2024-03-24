import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SharedModule } from 'src/shared/shared.module';
import { UsersService } from './services/users.service';
import { AppLogger } from 'src/shared/utils/logger.utils';
import { UsersController } from './controllers/users.controllers';

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaModule, AppLogger],
  exports: [UsersService],
})
export class UsersModule {}
