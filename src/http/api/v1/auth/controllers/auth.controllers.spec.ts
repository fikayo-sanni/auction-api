import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controllers';
import { AuthService } from '../services/auth.service';
import { AuthSignInDto } from '../dtos/auth.signin.dto';
import { Response } from 'express';
import {
  mockRegisteredUser,
  mockSignedInUser,
  mockUser,
  mockUserId,
  mockUserLogin,
} from '../mocks/auth.mock';
import { AuthRequest } from 'src/shared/types/auth.types';
import { UsersService } from '../../users/services/users.service';
import { AppLogger } from 'src/shared/utils/AppLogger';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/services/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockResponse = {
    send: jest.fn(),
    status: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        AppLogger,
        JwtService,
        PrismaService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe.skip('signup', () => {
    it('should call authService.signUp with correct arguments', async () => {
      const mockResult = mockRegisteredUser;
      jest.spyOn(authService, 'signUp').mockResolvedValueOnce(mockResult);

      await controller.signup(mockUser, mockResponse);

      expect(authService.signUp).toHaveBeenCalledWith(mockUser);
    });
  });

  describe.skip('signin', () => {
    it('should call authService.signIn with correct arguments', async () => {
      const mockData: AuthSignInDto = mockUserLogin;

      jest.spyOn(authService, 'signIn').mockResolvedValueOnce(mockSignedInUser);

      await controller.signin(mockData, mockResponse);

      expect(authService.signIn).toHaveBeenCalledWith(mockData);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with correct argument', async () => {
      const reqMock = {
        user: { sub: mockUserId.id },
      } as unknown as AuthRequest;
      jest
        .spyOn(authService, 'logout')
        .mockResolvedValueOnce(mockRegisteredUser);

      await controller.logout(reqMock);

      expect(authService.logout).toHaveBeenCalledWith(mockUserId.id);
    });
  });
});
