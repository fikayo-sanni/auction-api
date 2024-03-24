export const IS_PUBLIC_KEY = 'isPublic';
export interface AuthRequest extends Request {
  user: {
    sub: string;
  };
}

export interface JwtPayload {
  sub: string;
}
