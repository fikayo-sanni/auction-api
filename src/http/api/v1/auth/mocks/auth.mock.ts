import { User } from '@prisma/client';
import { hashString } from 'src/shared/utils/Hash';

export const mockUserLogin = {
  email: 'oluwafikayosanni@gmail.com',
  password: 'password',
};

export const mockUser = {
  ...mockUserLogin,
  email: 'oluwafikayosanni@gmail.com',
  firstname: 'oluwafiikayo',
  lastname: 'sanni',
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
  password: hashString(mockUser.password),
  timestamps,
} as unknown as User;

export const mockUserTokens = {
  refresh_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWEyM2I0MC0yYmEwLTQxNjItYTk2ZC00NjEwMDJmODAwNWUiLCJpYXQiOjE3MTEyNjUwNzEsImV4cCI6MTcxMTg2OTg3MX0.H-AfmyVh2L5pH52ku0oxI6rGZ0Y8y-EXl1yFV_343Zg',
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWEyM2I0MC0yYmEwLTQxNjItYTk2ZC00NjEwMDJmODAwNWUiLCJpYXQiOjE3MTEyNjUwNzEsImV4cCI6MTcxMTI5MDI3MX0.B-bn1GA3XLzEIyQxtcN9siDxAUyTVGRZG_gDZV-d6jo',
};

export const mockSignedInUser = {
  ...mockRegisteredUser,
  ...mockUserTokens,
} as unknown as User;
