import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controllers';
import { AuthService } from '../services/auth.service';
import { AuthSignUpDto } from '../dtos/auth.signup.dto';
import { AuthSignInDto } from '../dtos/auth.signin.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signUp with correct arguments', async () => {
      const mockUser: AuthSignUpDto = {
        /* mock user data */
      };
      const mockResult = {
        /* mock result data */
      };
      jest.spyOn(authService, 'signUp').mockResolvedValueOnce(mockResult);

      const reqMock = {
        /* mock request object */
      };
      const resMock = {
        /* mock response object */
      };
      await controller.signup(mockUser, reqMock, resMock);

      expect(authService.signUp).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('signin', () => {
    it('should call authService.signIn with correct arguments', async () => {
      const mockData: AuthSignInDto = {
        /* mock data */
      };
      const mockResult = {
        /* mock result */
      };
      jest.spyOn(authService, 'signIn').mockResolvedValueOnce(mockResult);

      const reqMock = {
        /* mock request object */
      };
      const resMock = {
        /* mock response object */
      };
      await controller.signin(mockData, reqMock, resMock);

      expect(authService.signIn).toHaveBeenCalledWith(mockData);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with correct argument', async () => {
      const reqMock = { user: { sub: 'mockUserId' } };
      jest.spyOn(authService, 'logout').mockResolvedValueOnce();

      await controller.logout(reqMock);

      expect(authService.logout).toHaveBeenCalledWith('mockUserId');
    });
  });
});
