import { User } from '@prisma/client';

export const mockUser = {
  email: 'oluwafikayosanni@gmail.com',
  firstname: 'oluwafiikayo',
  lastname: 'sanni',
  password: 'password',
};

export const mockUserId = {
  id: '0aa23b40-2ba0-4162-a96d-461002f8005e',
};

export const timestamps = {
  created_at: '2024-03-24T06:07:42.149Z',
  updated_at: '2024-03-24T06:07:42.149Z',
};

export const mockRegisteredUser = {
  ...mockUserId,
  refresh_token: null,
  ...mockUser,
  timestamps,
} as unknown as User;
