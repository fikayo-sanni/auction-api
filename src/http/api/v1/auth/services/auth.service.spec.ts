import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from 'src/shared/utils/AppLogger';
import { AuthSignUpDto } from '../dtos/auth.signup.dto';
import { AuthSignInDto } from '../dtos/auth.signin.dto';
import { BadRequestAppException } from 'src/shared/exceptions/BadRequestAppException';
import { UnAuthorizedAppException } from 'src/shared/exceptions/UnAuthorizedAppException';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersService, JwtService, AppLogger],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const user: AuthSignUpDto = {
        /* mock user data */
      };
      const createUserSpy = jest
        .spyOn(usersService, 'create')
        .mockResolvedValueOnce(user);

      const result = await service.signUp(user);

      expect(createUserSpy).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });

    it('should throw BadRequestAppException if email is in use', async () => {
      const user: AuthSignUpDto = {
        /* mock user data */
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(user);

      await expect(service.signUp(user)).rejects.toThrowError(
        BadRequestAppException,
      );
    });
  });

  describe('signin', () => {
    it('should sign in user and return tokens', async () => {
      const authData: AuthSignInDto = {
        /* mock auth data */
      };
      const user: User = {
        /* mock user data */
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(user);
      jest.spyOn(service, 'getTokens').mockResolvedValueOnce({
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
      });

      const result = await service.signIn(authData);

      expect(result).toEqual({
        ...user,
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
      });
    });

    it('should throw UnAuthorizedAppException if user does not exist', async () => {
      const authData: AuthSignInDto = {
        /* mock auth data */
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(null);

      await expect(service.signIn(authData)).rejects.toThrowError(
        UnAuthorizedAppException,
      );
    });

    it('should throw UnAuthorizedAppException if password is incorrect', async () => {
      const authData: AuthSignInDto = {
        /* mock auth data */
      };
      const user: User = {
        /* mock user data */
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(user);

      await expect(service.signIn(authData)).rejects.toThrowError(
        UnAuthorizedAppException,
      );
    });
  });

  describe('logout', () => {
    it("should nullify user's refresh token", async () => {
      const userId = 'mockUserId';
      const updateSpy = jest
        .spyOn(usersService, 'update')
        .mockResolvedValueOnce(null);

      await service.logout(userId);

      expect(updateSpy).toHaveBeenCalledWith(
        { id: userId },
        { refresh_token: null },
      );
    });
  });
});
