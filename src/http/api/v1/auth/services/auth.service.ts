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
import { Hash } from 'crypto';
import { hashString } from 'src/shared/utils/Hash';

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
    }
  }

  async signIn(user: AuthSignInDto): Promise<User> {
    try {
    } catch (e) {
      throw e;
    }
  }
}
