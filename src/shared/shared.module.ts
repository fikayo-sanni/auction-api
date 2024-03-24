import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { HttpResponse } from './utils/http.utils';
import { AppLogger } from './utils/logger.utils';

const providers = [HttpResponse, AppLogger, AccessTokenGuard, JwtService];

@Module({
  providers: [...providers, JwtService],
  exports: providers,
})
@Global()
export class SharedModule {}
