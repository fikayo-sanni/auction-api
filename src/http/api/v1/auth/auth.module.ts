import { Global, Module } from '@nestjs/common';

const providers = [];

@Module({
  providers: [...providers],
  exports: providers,
})
@Global()
export class AuthModule {}
