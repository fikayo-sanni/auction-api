import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import appConfiguration from '../../config/envs/app.config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { JwtPayload } from '../types/auth.types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  protected appConfig: ConfigType<typeof appConfiguration>;
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfiguration().JWT_SECRET,
    });

    this.appConfig = appConfiguration();
  }

  validate(payload: JwtPayload) {
    return { ...payload };
  }
}
