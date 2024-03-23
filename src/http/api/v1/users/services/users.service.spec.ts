import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { ServerAppException } from 'src/shared/exceptions/ServerAppException';
import { NotFoundAppException } from 'src/shared/exceptions/NotFoundAppException';
import { PaginationResult } from 'src/shared/interfaces/pagination.interface';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
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
      const mockData = {
        /* mock user data */
      };
      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce(mockData);

      const result = await service.create(mockData);

      expect(result).toEqual(mockData);
    });

    it('should throw ServerAppException if an error occurs', async () => {
      const mockData = {
        /* mock user data */
      };
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce(new Error());

      await expect(service.create(mockData)).rejects.toThrowError(
        ServerAppException,
      );
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        /* mock user data */
      };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockUser);

      const result = await service.findById('mockId');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundAppException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findById('mockId')).rejects.toThrowError(
        NotFoundAppException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        /* mock user data */
      };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockUser);

      const result = await service.findByEmail('mock@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundAppException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(
        service.findByEmail('mock@example.com'),
      ).rejects.toThrowError(NotFoundAppException);
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const mockUser = {
        /* mock user data */
      };
      jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce(mockUser);

      const result = await service.update(
        { id: 'mockId' },
        {
          /* mock update data */
        },
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw ServerAppException if an error occurs', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValueOnce(new Error());

      await expect(
        service.update(
          { id: 'mockId' },
          {
            /* mock update data */
          },
        ),
      ).rejects.toThrowError(ServerAppException);
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      const mockUser = {
        /* mock user data */
      };
      jest.spyOn(prismaService.user, 'delete').mockResolvedValueOnce(mockUser);

      const result = await service.remove('mockId');

      expect(result).toEqual(mockUser);
    });

    it('should throw ServerAppException if an error occurs', async () => {
      jest
        .spyOn(prismaService.user, 'delete')
        .mockRejectedValueOnce(new Error());

      await expect(service.remove('mockId')).rejects.toThrowError(
        ServerAppException,
      );
    });
  });

  describe('findAll', () => {
    it('should find all users with pagination options', async () => {
      const mockUsers = [
        /* mock user data */
      ];
      const mockPaginationResult: PaginationResult<User> = {
        items: mockUsers,
        count: 1,
      };
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValueOnce(mockUsers);
      jest.spyOn(prismaService.user, 'count').mockResolvedValueOnce(1);

      const result = await service.findAll({
        /* mock pagination options */
      });

      expect(result).toEqual(mockPaginationResult);
    });
  });
});
