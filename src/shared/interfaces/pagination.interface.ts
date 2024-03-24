import { Prisma } from '@prisma/client';

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface MetaResponse {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
  currentPage: number;
  previousPage: number | null;
  lastPage: number | null;
  perPage: number;
  total: number;
}

export interface IPaginationOptions {
  take: number;
  skip: number;
}

export interface IUserPaginationOptions extends IPaginationOptions {
  cursor?: Prisma.UserWhereUniqueInput;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
}

export interface PaginationResult<T> {
  items: T[];
  count: number;
}
