import { Global, Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controllers';
import { UsersService } from '../users/services/users.service';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { AppLogger } from 'src/shared/utils/AppLogger';
import { AuthService } from './services/auth.service';
import { JwtService } from '@nestjs/jwt';

const providers = [AuthService];

@Module({
  controllers: [AuthController],
  providers: [...providers, UsersService, PrismaService, AppLogger, JwtService],
  exports: providers,
})
@Global()
export class AuthModule {}
