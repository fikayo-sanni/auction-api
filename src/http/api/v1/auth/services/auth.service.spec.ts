import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from 'src/shared/utils/logger.utils';
import { AuthSignUpDto } from '../dtos/auth.signup.dto';
import { AuthSignInDto } from '../dtos/auth.signin.dto';
import { BadRequestAppException } from 'src/shared/exceptions/BadRequestAppException';
import { UnAuthorizedAppException } from 'src/shared/exceptions/UnAuthorizedAppException';
import {
  mockRegisteredUser,
  mockSignedInUser,
  mockUser,
  mockUserLogin,
  mockUserTokens,
} from '../mocks/auth.mock';
import { hashString } from 'src/shared/utils/hash.utils';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/services/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        JwtService,
        AppLogger,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const user: AuthSignUpDto = mockUser;

      const createUserSpy = jest
        .spyOn(usersService, 'create')
        .mockResolvedValueOnce(mockRegisteredUser);

      const result = await service.signUp(user);

      expect(createUserSpy).toHaveBeenCalledWith({
        ...user,
        password: hashString('password'),
      });
      expect(result).toEqual(mockRegisteredUser);
    });

    it('should throw BadRequestAppException if email is in use', async () => {
      const user: AuthSignUpDto = mockRegisteredUser;
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValueOnce(mockRegisteredUser);

      await expect(service.signUp(user)).rejects.toThrowError(
        BadRequestAppException,
      );
    });
  });

  describe('signin', () => {
    it('should sign in user and return tokens', async () => {
      const authData: AuthSignInDto = mockUserLogin;
      const user: User = mockSignedInUser;
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(user);
      jest.spyOn(service, 'getTokens').mockResolvedValueOnce(mockUserTokens);

      const result = await service.signIn(authData);

      expect(result).toEqual({
        ...user,
        ...mockUserTokens,
      });
    });

    it('should throw UnAuthorizedAppException if user does not exist', async () => {
      const authData: AuthSignInDto = mockUserLogin;
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(null);

      await expect(service.signIn(authData)).rejects.toThrowError(
        UnAuthorizedAppException,
      );
    });

    it('should throw UnAuthorizedAppException if password is incorrect', async () => {
      const authData: AuthSignInDto = { ...mockUserLogin, password: 'passy' };
      const user: User = {
        ...mockSignedInUser,
        password: 'passy',
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
