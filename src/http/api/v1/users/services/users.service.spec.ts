import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { PaginationResult } from 'src/shared/interfaces/pagination.interface';
import { mockUser, mockRegisteredUser, mockUserId } from '../mocks/users.mock';
import { User } from 'next-auth';
import { AppLogger } from 'src/shared/utils/logger.utils';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        AppLogger,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValueOnce(mockRegisteredUser);

      const result = await service.create(mockUser);

      expect(result).toEqual(mockRegisteredUser);
    });

    it('should throw Error if an error occurs', async () => {
      const mockData = mockUser;
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce(new Error());

      await expect(service.create(mockData)).rejects.toThrowError(Error);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockRegisteredUser);

      const result = await service.findById(mockUserId.id);

      expect(result).toEqual(mockRegisteredUser);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(await service.findById('mockId')).toBe(null);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockRegisteredUser);

      const result = await service.findByEmail(mockRegisteredUser.email);

      expect(result).toEqual(mockRegisteredUser);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(await service.findByEmail(mockRegisteredUser.email)).toBe(
        null,
      );
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const update = { lastname: 'jackson' };
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce({ ...mockRegisteredUser, ...update });

      const result = await service.update({ id: mockUserId.id }, update);

      expect(result).toEqual({ ...mockRegisteredUser, ...update });
    });

    it('should throw Error if an error occurs', async () => {
      const update = { lastname: 'jackson' };
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValueOnce(new Error());

      await expect(
        service.update({ id: 'mockId' }, update),
      ).rejects.toThrowError(Error);
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      jest
        .spyOn(prismaService.user, 'delete')
        .mockResolvedValueOnce(mockRegisteredUser);

      const result = await service.remove(mockUserId.id);

      expect(result).toEqual(mockRegisteredUser);
    });

    it('should throw Error if an error occurs', async () => {
      jest
        .spyOn(prismaService.user, 'delete')
        .mockRejectedValueOnce(new Error());

      await expect(service.remove('mockId')).rejects.toThrowError(Error);
    });
  });

  describe('findAll', () => {
    it('should find all users with pagination options', async () => {
      const mockUsers = [mockRegisteredUser];
      const mockPaginationResult: PaginationResult<User> = {
        items: mockUsers,
        count: 1,
      };
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValueOnce(mockUsers);
      jest.spyOn(prismaService.user, 'count').mockResolvedValueOnce(1);

      const result = await service.findAll({
        take: 10,
        skip: 10,
      });

      expect(result).toEqual(mockPaginationResult);
    });
  });
});
