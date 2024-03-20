import { Injectable } from '@nestjs/common';
import appConfiguration from 'src/config/envs/app.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { AppLogger } from 'src/shared/utils/AppLogger';
import { User } from '@prisma/client';
import { AuthSignUpDto } from '../dtos/auth.signup.dto';
import { BadRequestAppException } from 'src/shared/exceptions/BadRequestAppException';
import { ResponseMessages } from 'src/constants/ResponseMessages';
import { AuthSignInDto } from '../dtos/auth.signin.dto';
import { hashString } from 'src/shared/utils/Hash';
import { UnAuthorizedAppException } from 'src/shared/exceptions/UnAuthorizedAppException';

@Injectable()
export class AuthService {
  protected appConfig: ConfigType<typeof appConfiguration>;
  constructor(
    private readonly usersService: UsersService,
    private appLogger: AppLogger,
    private readonly jwtService: JwtService,
  ) {
    this.appConfig = appConfiguration();
  }

  async signUp(user: AuthSignUpDto): Promise<User> {
    try {
      // check if user email is in use
      const exists = await this.usersService.findByEmail(user.email);
      if (exists) {
        // throw error if email is in use
        throw new BadRequestAppException(ResponseMessages.CREDENTIALS_IN_USE);
      }

      // has user password
      Object.assign(user, { password: hashString(user.password) });

      return await this.usersService.create(user);
    } catch (e) {
      this.appLogger.logError(e);
      throw e;
    }
  }

  async signIn(auth: AuthSignInDto): Promise<User> {
    try {
      // fetch user by email
      const user = await this.usersService.findByEmail(auth.email);

      // if user does not exist or password doesnt match, throw login failure
      if (!user || user.password !== hashString(auth.password)) {
        throw new UnAuthorizedAppException(ResponseMessages.USER_LOGIN_FAILED);
      }

      const tokens = await this.getTokens(user.id);

      return { ...user, ...tokens };
    } catch (e) {
      this.appLogger.logError(e);
      throw e;
    }
  }

  async getTokens(id: string) {
    // generate 7h access token and 7d refresh token
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
        },
        {
          secret: this.appConfig.JWT_SECRET,
          expiresIn: '7h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: id,
        },
        {
          secret: this.appConfig.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    // update user record to contain refresh token
    await this.usersService.update({ id }, { refresh_token });
    return {
      access_token,
      refresh_token,
    };
  }

  async logout(id: string) {
    // nullify user's refresh token
    return this.usersService.update({ id }, { refresh_token: null });
  }

  // TODO: create forgotPassword
  async forgotPassword() {}

  // TODO: implement changePassword
  async changePassword() {}
}
