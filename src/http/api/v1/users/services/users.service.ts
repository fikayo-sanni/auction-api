import { Injectable } from '@nestjs/common';
import { ServerAppException } from 'src/shared/exceptions/ServerAppException';
import { NotFoundAppException } from 'src/shared/exceptions/NotFoundAppException';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { User, Prisma } from '@prisma/client';
import { ResponseMessages } from 'src/constants/ResponseMessages';
import { AppLogger } from 'src/shared/utils/logger.utils';
import {
  IUserPaginationOptions,
  PaginationResult,
} from 'src/shared/interfaces/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly appLogger: AppLogger,
  ) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (e) {
      throw new ServerAppException(ResponseMessages.SOMETHING_WENT_WRONG, e);
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          contracts: true,
          bids: true,
        },
      });

      // I am allowing refresh_token and password to be returned here
      return user;
    } catch (e) {
      throw new NotFoundAppException(ResponseMessages.NOT_FOUND);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      return user;
    } catch (e) {
      throw new NotFoundAppException(ResponseMessages.NOT_FOUND, e);
    }
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    updateUserDto: Partial<Prisma.UserCreateInput>,
  ): Promise<User> {
    try {
      return this.prisma.user.update({
        data: { ...updateUserDto, updated_at: new Date() },
        where,
      });
    } catch (e) {
      throw new ServerAppException(ResponseMessages.USER_UPDATE_FAILED, e);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      return this.prisma.user.delete({ where: { id } });
    } catch (e) {
      throw new ServerAppException(ResponseMessages.USER_DELETE_FAILED, e);
    }
  }

  async findAll(
    params: IUserPaginationOptions,
  ): Promise<PaginationResult<User>> {
    const items = await this.prisma.user.findMany({ ...params });

    const count = await this.prisma.user.count();

    return { items, count };
  }
}
