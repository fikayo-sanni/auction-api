import { Global, Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controllers';
import { UsersService } from '../users/services/users.service';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { AppLogger } from 'src/shared/utils/AppLogger';
import { AuthService } from './services/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SharedModule } from 'src/shared/shared.module';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from 'src/shared/strategies/accessToken.strategy';

const providers = [AuthService];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [
    ...providers,
    UsersService,
    PrismaService,
    AppLogger,
    JwtService,
    AccessTokenStrategy,
  ],
  exports: providers,
})
@Global()
export class AuthModule {}
